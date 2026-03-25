import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import * as THREE from 'three'
import type { CanvasRenderer } from './CanvasRenderer'
import { computeTransitionProgress, resolveImageAtTime } from './transitionUtils'
import type { ImageAsset, AudioAsset, EffectConfig } from '@/types'

export interface ExportOptions {
  fps: 30 | 60
  images: ImageAsset[]
  audio: AudioAsset | null
  effect: EffectConfig
  // Callback lấy texture từ cache trong useCanvasEngine — tránh load lại từ disk
  getTexturesByIndex: (idx: number) => { texA: THREE.Texture | null; texB: THREE.Texture | null }
  onProgress: (progress: number, message: string) => void
}

export class FFmpegExporter {
  private ffmpeg: FFmpeg
  private loaded = false

  constructor() {
    this.ffmpeg = new FFmpeg()
  }

  async load(onLog?: (msg: string) => void) {
    // Guard: tránh load lại nếu đã sẵn sàng
    if (this.loaded || this.ffmpeg.loaded) {
      this.loaded = true
      return
    }

    if (onLog) {
      this.ffmpeg.on('log', ({ message }) => onLog(message))
    }

    const LOCAL_BASE = '/ffmpeg-core'
    const CDN_BASE   = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

    const hasLocal = await this.checkLocal(`${LOCAL_BASE}/ffmpeg-core.js`)
    const base     = hasLocal ? LOCAL_BASE : CDN_BASE
    if (!hasLocal) console.warn('[FFmpeg] Local core not found → fallback CDN')

    // ── Tại sao phải dùng ESM build + toBlobURL ──────────────────────────
    // @ffmpeg/ffmpeg v0.12 tạo worker với type:"module" → importScripts()
    // không khả dụng trong module worker → worker luôn rơi vào catch block
    // và dùng dynamic import(): self.createFFmpegCore = (await import(coreURL)).default
    //
    // UMD build không có .default export khi được dynamic import() dưới dạng
    // ES module → self.createFFmpegCore = undefined → ERROR_IMPORT_FAILURE.
    //
    // ESM build có `export default createFFmpegCore` → .default hợp lệ ✓
    //
    // toBlobURL cho wasmURL: worker tính wasmURL từ coreURL nếu không cung cấp
    // (replace .js → .wasm), nhưng blob URL không thể replace extension đúng
    // → phải explicit truyền wasmURL. Worker embed wasmURL vào mainScriptUrlOrBlob
    // fragment dạng #btoa(JSON) để Emscripten locateFile tìm đúng wasm.
    const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`,   'text/javascript')
    const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm')

    await this.ffmpeg.load({ coreURL, wasmURL })
    this.loaded = true
  }

  private async checkLocal(url: string): Promise<boolean> {
    try {
      const res = await fetch(url, { method: 'HEAD' })
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Capture frames from canvas and encode to MP4.
   * Runs synchronously frame-by-frame — blocks UI so call from a Worker
   * or yield with small async gaps to keep the browser responsive.
   */
  async export(
    renderer: CanvasRenderer,
    options: ExportOptions,
  ): Promise<Blob> {
    const { fps, images, audio, effect, getTexturesByIndex, onProgress } = options

    if (!this.loaded) {
      throw new Error('FFmpeg not loaded. Call .load() first.')
    }

    const totalFrames = Math.ceil(
      images.reduce((s, img) => s + img.duration, 0) * fps
    )

    // ── Phase 1: Capture frames ────────────────────────────────────────
    // Tua currentTime theo từng frame (1/fps giây) thay vì lồng 2 vòng for,
    // đảm bảo logic tính progress đồng nhất với preview loop
    const frameDuration = 1 / fps

    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const currentTime = frameIndex * frameDuration

      // Resolve ảnh nào đang hiển thị tại thời điểm này
      const { index } = resolveImageAtTime(currentTime, images)

      // Resolve effect type cho image hiện tại (cycling — giống preview)
      const effectType = effect.types[index % effect.types.length]
      renderer.applyEffect(effectType, effect.intensity)

      // Set đúng cặp texture trước khi render
      const { texA, texB } = getTexturesByIndex(index)
      renderer.setTextures(texA, texB)

      // Tính transition progress — dùng cùng hàm với preview
      const progress = computeTransitionProgress(currentTime, index, images, effect.duration)
      renderer.setProgress(progress)
      renderer.renderFrame()

      // Capture PNG từ canvas
      const blob = await renderer.captureFrame()
      const arrayBuffer = await blob.arrayBuffer()
      const uint8 = new Uint8Array(arrayBuffer)

      const frameName = `frame_${String(frameIndex).padStart(6, '0')}.png`
      await this.ffmpeg.writeFile(frameName, uint8)

      const captureProgress = Math.round(((frameIndex + 1) / totalFrames) * 70)
      onProgress(captureProgress, `Capturing frame ${frameIndex + 1} / ${totalFrames}`)

      // Yield mỗi 10 frame để browser không bị freeze
      if ((frameIndex + 1) % 10 === 0) {
        await new Promise<void>((r) => setTimeout(r, 0))
      }
    }

    onProgress(72, 'Writing audio...')

    // ── Phase 2: Write audio file ──────────────────────────────────────
    if (audio) {
      const audioData = await fetchFile(audio.file)
      await this.ffmpeg.writeFile('audio.mp3', audioData)
    }

    onProgress(75, 'Encoding video...')

    // ── Phase 3: FFmpeg encode ─────────────────────────────────────────
    this.ffmpeg.on('progress', ({ progress }) => {
      const encodeProgress = 75 + Math.round(progress * 24)
      onProgress(encodeProgress, 'Encoding MP4...')
    })

    const inputPattern = 'frame_%06d.png'
    const outputFile   = 'output.mp4'

    // Thời lượng video tính từ tổng duration của các ảnh
    const videoDuration = images.reduce((s, img) => s + img.duration, 0)

    let ffmpegArgs: string[]

    if (!audio) {
      // Không có audio — encode video thuần
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', inputPattern,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-t', String(videoDuration),
        '-movflags', '+faststart',
        outputFile,
      ]
    } else if (audio.duration >= videoDuration) {
      // Audio DÀI hơn video → cắt audio tại điểm kết thúc video bằng -t
      // KHÔNG dùng -shortest vì nếu video stream hết trước audio,
      // -shortest sẽ cắt đúng, nhưng -t an toàn hơn và explicit hơn
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', inputPattern,
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', String(videoDuration),   // cắt cả 2 stream tại đây
        '-movflags', '+faststart',
        outputFile,
      ]
    } else {
      // Audio NGẮN hơn video → loop audio cho đến khi phủ hết video
      // -stream_loop -1 phải đặt TRƯỚC -i audio để áp dụng cho input đó
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', inputPattern,
        '-stream_loop', '-1',          // loop audio vô hạn
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-t', String(videoDuration),   // cắt tại đúng độ dài video
        '-movflags', '+faststart',
        outputFile,
      ]
    }

    await this.ffmpeg.exec(ffmpegArgs)

    onProgress(99, 'Finalizing...')

    // ── Phase 4: Read output ───────────────────────────────────────────
    const outputData = await this.ffmpeg.readFile(outputFile)
    // Dùng .buffer để lấy đúng ArrayBuffer từ Uint8Array (theo pattern của reference code)
    const uint8Output = outputData as Uint8Array
    // Slice to get a plain ArrayBuffer (not SharedArrayBuffer) for Blob constructor
    const arrayBuffer = uint8Output.buffer.slice(
      uint8Output.byteOffset,
      uint8Output.byteOffset + uint8Output.byteLength,
    ) as ArrayBuffer
    const mp4Blob = new Blob(
      [arrayBuffer],
      { type: 'video/mp4' },
    )

    // Clean up FS
    await this.ffmpeg.deleteFile(outputFile)

    onProgress(100, 'Done!')

    return mp4Blob
  }

  /** Kill the FFmpeg worker — used for cancel */
  terminate() {
    try { this.ffmpeg.terminate() } catch { /* ignore */ }
    this.loaded = false
  }

  /** Download a blob as a file */
  static downloadBlob(blob: Blob, filename = 'chronovision_export.mp4') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
