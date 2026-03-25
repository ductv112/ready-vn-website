import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { CanvasRenderer } from '@/engine/CanvasRenderer'
import { computeTransitionProgress } from '@/engine/transitionUtils'
import { useStore } from '@/store/useStore'

const RENDER_WIDTH  = 1080
const RENDER_HEIGHT = 1920

/**
 * Manages the Three.js WebGL canvas renderer.
 * Attaches to a <canvas> ref and drives the animation loop.
 */
export function useCanvasEngine(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const rendererRef = useRef<CanvasRenderer | null>(null)

  // Texture cache: imageId → THREE.Texture
  const textureCache = useRef<Map<string, THREE.Texture>>(new Map())

  const { images, effect, playback } = useStore()

  // ── Init renderer when canvas mounts ──────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new CanvasRenderer(canvas, RENDER_WIDTH, RENDER_HEIGHT)
    rendererRef.current = renderer

    return () => {
      renderer.dispose()
      textureCache.current.forEach((tex) => tex.dispose())
      textureCache.current.clear()
      rendererRef.current = null
    }
  }, [canvasRef])

  // ── Re-render khi effect thay đổi (paused) — updateShaderTextures tự resolve type
  useEffect(() => {
    if (playback.status !== 'playing') {
      updateShaderTextures()
      rendererRef.current?.renderFrame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect])

  // ── Pre-load textures whenever images change ───────────────────────────
  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    const loadAll = async () => {
      for (const img of images) {
        if (!textureCache.current.has(img.id)) {
          const tex = await renderer.loadTexture(img)
          textureCache.current.set(img.id, tex)
        }
      }

      // Giải phóng texture của ảnh đã bị xóa khỏi danh sách
      const currentIds = new Set(images.map((i) => i.id))
      for (const [id, tex] of textureCache.current) {
        if (!currentIds.has(id)) {
          tex.dispose()
          textureCache.current.delete(id)
        }
      }

      // Render ngay sau khi textures load xong để canvas không bị đen
      // (playback ở trạng thái idle nên không có loop nào render sẵn)
      if (!useStore.getState().playback.status.includes('playing')) {
        updateShaderTextures()
        renderer.renderFrame()
      }
    }

    loadAll()
  }, [images])

  // ── Cập nhật textures + progress lên shader ────────────────────────────
  // Dùng useStore.getState() thay vì closure để luôn đọc state mới nhất,
  // tránh stale closure trong animation loop chạy qua rAF
  const updateShaderTextures = useCallback(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    // Đọc trực tiếp từ store — không capture qua React closure
    const { images: imgs, playback: pb, effect: eff } = useStore.getState()
    if (imgs.length === 0) return

    const idx = pb.currentImageIndex
    const currentImg = imgs[idx]
    const nextImg    = imgs[idx + 1] ?? null  // null nếu là ảnh cuối

    const texA = textureCache.current.get(currentImg.id) ?? null
    // Ảnh cuối: texB = texA (shader sẽ nhận progress = 0, không transition)
    const texB = nextImg ? (textureCache.current.get(nextImg.id) ?? texA) : texA

    // Resolve effect type cho image hiện tại (cycling qua danh sách types)
    const effectType = eff.types[idx % eff.types.length]
    renderer.applyEffect(effectType, eff.intensity)

    renderer.setTextures(texA, texB)

    const progress = computeTransitionProgress(pb.currentTime, idx, imgs, eff.duration)
    renderer.setProgress(progress)
  }, [])

  // ── Drive animation loop khi đang play ────────────────────────────────
  const exportStatus = useStore((s) => s.exportState.status)
  const isExporting  = exportStatus === 'capturing' || exportStatus === 'encoding'

  useEffect(() => {
    const renderer = rendererRef.current
    if (!renderer) return

    // Tắt loop khi export đang chạy — nhường GPU cho export pipeline
    if (playback.status !== 'playing' || isExporting) {
      renderer.stopRenderLoop()
      return
    }

    let lastTimestamp: number | null = null

    const onFrame = () => {
      const now = performance.now()
      if (lastTimestamp !== null) {
        const delta = (now - lastTimestamp) / 1000
        // Đọc tickPlayback từ store trực tiếp — tránh stale closure
        // khi useEffect chỉ re-run theo playback.status
        useStore.getState().tickPlayback(delta)
        updateShaderTextures()
      }
      lastTimestamp = now
    }

    renderer.startRenderLoop(onFrame)
    return () => renderer.stopRenderLoop()
  }, [playback.status, updateShaderTextures, isExporting])

  // ── Render 1 frame khi seek hoặc pause (không dùng loop) ──────────────
  useEffect(() => {
    if (playback.status !== 'playing') {
      updateShaderTextures()
      rendererRef.current?.renderFrame()
    }
  }, [playback.currentTime, playback.status, updateShaderTextures])

  // ── Texture getter cho export loop ────────────────────────────────────
  // Trả về texA (ảnh hiện tại) và texB (ảnh kế tiếp) theo index
  // Export loop gọi hàm này mỗi frame để set đúng cặp texture
  const getTexturesByIndex = useCallback(
    (idx: number): { texA: THREE.Texture | null; texB: THREE.Texture | null } => {
      const { images: imgs } = useStore.getState()
      const currentImg = imgs[idx]
      const nextImg    = imgs[idx + 1] ?? null
      if (!currentImg) return { texA: null, texB: null }
      const texA = textureCache.current.get(currentImg.id) ?? null
      const texB = nextImg ? (textureCache.current.get(nextImg.id) ?? texA) : texA
      return { texA, texB }
    },
    [],
  )

  return { rendererRef, getTexturesByIndex }
}
