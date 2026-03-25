import { useRef, useCallback, useState } from 'react'
import * as THREE from 'three'
import { FFmpegExporter } from '@/engine/FFmpegExporter'
import { useStore } from '@/store/useStore'
import type { CanvasRenderer } from '@/engine/CanvasRenderer'

type GetTexturesByIndex = (idx: number) => {
  texA: THREE.Texture | null
  texB: THREE.Texture | null
}

export function useVideoExport() {
  const exporterRef  = useRef<FFmpegExporter | null>(null)

  // Blob MP4 sau khi render xong — giữ lại để download sau mà không encode lại
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null)
  const renderedUrlRef = useRef<string | null>(null)

  const { images, audio, effect, exportState, setExportStatus, pause } = useStore()

  const isRendering = exportState.status === 'capturing' || exportState.status === 'encoding'

  // ── Bước 1: Render video (capture + encode) ────────────────────────────
  const renderVideo = useCallback(
    async (renderer: CanvasRenderer, getTexturesByIndex: GetTexturesByIndex) => {
      if (isRendering || images.length === 0) return

      // Dừng preview khi bắt đầu render — giải phóng GPU cho export loop
      pause()

      // Reset blob cũ
      if (renderedUrlRef.current) {
        URL.revokeObjectURL(renderedUrlRef.current)
        renderedUrlRef.current = null
      }
      setRenderedBlob(null)

      if (!exporterRef.current) {
        exporterRef.current = new FFmpegExporter()
      }

      try {
        if (typeof SharedArrayBuffer === 'undefined') {
          throw new Error(
            'SharedArrayBuffer không khả dụng. ' +
            'Trình duyệt cần header COOP + COEP — hãy chạy qua: npm run preview',
          )
        }

        setExportStatus('capturing', 0, 'Loading FFmpeg...')

        await exporterRef.current.load((log) => {
          console.debug('[ffmpeg]', log)
        })

        setExportStatus('capturing', 5, 'Starting capture...')

        const blob = await exporterRef.current.export(renderer, {
          fps: exportState.fps,
          images,
          audio,
          effect,
          getTexturesByIndex,
          onProgress: (progress, message) => {
            const status = progress < 75 ? 'capturing' : 'encoding'
            setExportStatus(status, progress, message)
          },
        })

        // Lưu blob + tạo object URL để hiển thị video player
        const url = URL.createObjectURL(blob)
        renderedUrlRef.current = url
        setRenderedBlob(blob)
        setExportStatus('done', 100, 'Render hoàn tất!')

      } catch (err) {
        // Nếu bị cancel thì exporter đã null — không set error
        if (!exporterRef.current) return

        const msg =
          err instanceof Error ? err.message
          : typeof err === 'string' ? err
          : JSON.stringify(err)
        console.error('[Render] Failed:', err)
        setExportStatus('error', 0, msg || 'Lỗi không xác định — xem Console')
      }
    },
    [images, audio, effect, exportState.fps, isRendering, setExportStatus, pause],
  )

  // ── Cancel: kill worker, reset về idle ────────────────────────────────
  const cancelRender = useCallback(() => {
    if (exporterRef.current) {
      exporterRef.current.terminate()
      exporterRef.current = null
    }
    setExportStatus('idle', 0, '')
  }, [setExportStatus])

  // ── Bước 2: Download file đã render — không encode lại ────────────────
  const downloadVideo = useCallback(() => {
    if (!renderedBlob) return
    FFmpegExporter.downloadBlob(renderedBlob)
  }, [renderedBlob])

  // Object URL để feed vào <video> element
  const renderedVideoUrl = renderedUrlRef.current

  return {
    renderVideo,
    cancelRender,
    downloadVideo,
    isRendering,
    renderedBlob,
    renderedVideoUrl,
    exportState,
  }
}
