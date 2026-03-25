import type { ImageAsset } from '@/types'

/**
 * Hàm thuần tính transition progress tại một thời điểm.
 * Dùng chung cho cả preview loop (useCanvasEngine) và export loop (FFmpegExporter).
 *
 * @param currentTime   - Thời gian tuyệt đối trong toàn bộ video (giây)
 * @param currentIndex  - Index của ảnh đang hiển thị
 * @param images        - Mảng tất cả ảnh
 * @param effectDuration - Thời lượng transition (giây)
 * @returns progress 0.0 → 1.0
 */
export function computeTransitionProgress(
  currentTime: number,
  currentIndex: number,
  images: ImageAsset[],
  effectDuration: number,
): number {
  if (images.length === 0) return 0

  // Ảnh cuối — không có gì để transition sang
  if (currentIndex >= images.length - 1) return 0

  const currentImg = images[currentIndex]

  // Thời gian đã qua trước ảnh hiện tại
  let elapsed = 0
  for (let i = 0; i < currentIndex; i++) elapsed += images[i].duration
  const localTime = currentTime - elapsed

  // Transition không được dài hơn 90% duration của ảnh
  const safeEffectDuration = Math.min(effectDuration, currentImg.duration * 0.9)

  // Guard: tránh chia cho 0
  if (safeEffectDuration < 0.001) return 0

  // Thời điểm bắt đầu transition (clamped về 0 nếu effect quá dài)
  const transitionStart = Math.max(0, currentImg.duration - safeEffectDuration)

  return Math.max(0, Math.min(1, (localTime - transitionStart) / safeEffectDuration))
}

/**
 * Tính index ảnh và thời gian cục bộ tại một currentTime cụ thể.
 * Hữu ích cho export loop khi cần tua thủ công qua từng frame.
 */
export function resolveImageAtTime(
  currentTime: number,
  images: ImageAsset[],
): { index: number; localTime: number } {
  let elapsed = 0
  for (let i = 0; i < images.length; i++) {
    const next = elapsed + images[i].duration
    if (currentTime < next) {
      return { index: i, localTime: currentTime - elapsed }
    }
    elapsed = next
  }
  return { index: images.length - 1, localTime: images[images.length - 1]?.duration ?? 0 }
}
