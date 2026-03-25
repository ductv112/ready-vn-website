// ─── Asset Types ───────────────────────────────────────────────────────────

export interface ImageAsset {
  id: string
  file: File
  objectUrl: string    // URL.createObjectURL(file)
  name: string
  width: number
  height: number
  duration: number     // seconds this image is held on screen
}

export interface AudioAsset {
  file: File
  objectUrl: string
  name: string
  duration: number     // total audio duration in seconds
}

// ─── Effect Types ──────────────────────────────────────────────────────────

export type EffectType = 'crossfade' | 'infinite-zoom' | '3d-distortion'

export interface EffectConfig {
  types: EffectType[]  // 1 or more — cycled per transition when >1
  duration: number     // transition duration in seconds
  intensity: number    // 0–1, effect strength
}

// ─── Playback State ────────────────────────────────────────────────────────

export type PlaybackStatus = 'idle' | 'playing' | 'paused'

export interface PlaybackState {
  status: PlaybackStatus
  currentTime: number    // seconds elapsed
  totalDuration: number  // sum of all image durations
  currentImageIndex: number
}

// ─── Export State ──────────────────────────────────────────────────────────

export type ExportStatus = 'idle' | 'capturing' | 'encoding' | 'done' | 'error'

export interface ExportState {
  status: ExportStatus
  progress: number      // 0–100
  fps: 30 | 60
  outputResolution: { width: 1080; height: 1920 }
  message: string
}

// ─── Canvas Engine Config ──────────────────────────────────────────────────

export interface CanvasConfig {
  renderWidth: number      // 1080 — full res for export
  renderHeight: number     // 1920
  previewScale: number     // 0–1, how much to downscale for preview
}

// ─── App Store Shape ──────────────────────────────────────────────────────

export interface AppStore {
  // Assets
  images: ImageAsset[]
  audio: AudioAsset | null

  // Settings
  effect: EffectConfig
  defaultImageDuration: number   // seconds per image

  // Playback
  playback: PlaybackState

  // Export
  exportState: ExportState

  // Actions — Images
  addImages: (files: File[]) => void
  removeImage: (id: string) => void
  reorderImages: (fromIndex: number, toIndex: number) => void
  setImageDuration: (id: string, duration: number) => void

  // Actions — Audio
  setAudio: (file: File) => void
  removeAudio: () => void

  // Actions — Effect
  setEffect: (config: Partial<EffectConfig>) => void

  // Actions — Playback
  play: () => void
  pause: () => void
  seek: (time: number) => void
  resetPlayback: () => void
  tickPlayback: (delta: number) => void

  // Actions — Export
  setExportStatus: (status: ExportStatus, progress?: number, message?: string) => void
  setFps: (fps: 30 | 60) => void
}
