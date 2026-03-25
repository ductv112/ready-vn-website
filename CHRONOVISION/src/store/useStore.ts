import { create } from 'zustand'
import type {
  AppStore,
  ImageAsset,
  AudioAsset,
  EffectConfig,
  ExportStatus,
  PlaybackStatus,
} from '@/types'

// Polyfill uuid with crypto.randomUUID
const genId = () => crypto.randomUUID()

const DEFAULT_EFFECT: EffectConfig = {
  types: ['infinite-zoom'],
  duration: 0.8,
  intensity: 0.7,
}

const DEFAULT_IMAGE_DURATION = 2.5 // seconds

function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

function loadAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
      URL.revokeObjectURL(url)
    }
    audio.src = url
  })
}

function computeTotalDuration(images: ImageAsset[]): number {
  return images.reduce((acc, img) => acc + img.duration, 0)
}

function currentIndexAt(images: ImageAsset[], time: number): number {
  let elapsed = 0
  for (let i = 0; i < images.length; i++) {
    elapsed += images[i].duration
    if (time < elapsed) return i
  }
  return Math.max(0, images.length - 1)
}

export const useStore = create<AppStore>((set, get) => ({
  // ── Initial State ──────────────────────────────────────────────────────
  images: [],
  audio: null,
  effect: DEFAULT_EFFECT,
  defaultImageDuration: DEFAULT_IMAGE_DURATION,

  playback: {
    status: 'idle' as PlaybackStatus,
    currentTime: 0,
    totalDuration: 0,
    currentImageIndex: 0,
  },

  exportState: {
    status: 'idle',
    progress: 0,
    fps: 30,
    outputResolution: { width: 1080, height: 1920 },
    message: '',
  },

  // ── Image Actions ──────────────────────────────────────────────────────
  addImages: async (files: File[]) => {
    const validFiles = files.filter((f) =>
      f.type.startsWith('image/') && ['image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    )

    const newAssets: ImageAsset[] = await Promise.all(
      validFiles.map(async (file) => {
        const objectUrl = URL.createObjectURL(file)
        const { width, height } = await loadImageDimensions(file)
        return {
          id: genId(),
          file,
          objectUrl,
          name: file.name,
          width,
          height,
          duration: get().defaultImageDuration,
        }
      })
    )

    set((state) => {
      const images = [...state.images, ...newAssets]
      return {
        images,
        playback: {
          ...state.playback,
          totalDuration: computeTotalDuration(images),
        },
      }
    })
  },

  removeImage: (id: string) => {
    set((state) => {
      const images = state.images.filter((img) => img.id !== id)
      return {
        images,
        playback: {
          ...state.playback,
          totalDuration: computeTotalDuration(images),
        },
      }
    })
  },

  reorderImages: (fromIndex: number, toIndex: number) => {
    set((state) => {
      const images = [...state.images]
      const [moved] = images.splice(fromIndex, 1)
      images.splice(toIndex, 0, moved)
      return { images }
    })
  },

  setImageDuration: (id: string, duration: number) => {
    set((state) => {
      const images = state.images.map((img) =>
        img.id === id ? { ...img, duration: Math.max(0.5, duration) } : img
      )
      return {
        images,
        playback: {
          ...state.playback,
          totalDuration: computeTotalDuration(images),
        },
      }
    })
  },

  // ── Audio Actions ──────────────────────────────────────────────────────
  setAudio: async (file: File) => {
    const objectUrl = URL.createObjectURL(file)
    const duration = await loadAudioDuration(file)
    const asset: AudioAsset = { file, objectUrl, name: file.name, duration }
    set({ audio: asset })
  },

  removeAudio: () => {
    const { audio } = get()
    if (audio) URL.revokeObjectURL(audio.objectUrl)
    set({ audio: null })
  },

  // ── Effect Actions ─────────────────────────────────────────────────────
  setEffect: (config) => {
    set((state) => ({ effect: { ...state.effect, ...config } }))
  },

  // ── Playback Actions ───────────────────────────────────────────────────
  play: () => {
    set((state) => ({
      playback: { ...state.playback, status: 'playing' },
    }))
  },

  pause: () => {
    set((state) => ({
      playback: { ...state.playback, status: 'paused' },
    }))
  },

  seek: (time: number) => {
    const { images } = get()
    const clamped = Math.max(0, Math.min(time, computeTotalDuration(images)))
    set((state) => ({
      playback: {
        ...state.playback,
        currentTime: clamped,
        currentImageIndex: currentIndexAt(images, clamped),
      },
    }))
  },

  resetPlayback: () => {
    set((state) => ({
      playback: {
        ...state.playback,
        status: 'idle',
        currentTime: 0,
        currentImageIndex: 0,
      },
    }))
  },

  tickPlayback: (delta: number) => {
    const { images, playback } = get()
    const totalDuration = computeTotalDuration(images)
    const nextTime = playback.currentTime + delta

    if (nextTime >= totalDuration) {
      set((state) => ({
        playback: {
          ...state.playback,
          status: 'idle',
          currentTime: totalDuration,
          currentImageIndex: Math.max(0, images.length - 1),
        },
      }))
      return
    }

    set((state) => ({
      playback: {
        ...state.playback,
        currentTime: nextTime,
        currentImageIndex: currentIndexAt(images, nextTime),
      },
    }))
  },

  // ── Export Actions ─────────────────────────────────────────────────────
  setExportStatus: (status: ExportStatus, progress = 0, message = '') => {
    set((state) => ({
      exportState: { ...state.exportState, status, progress, message },
    }))
  },

  setFps: (fps: 30 | 60) => {
    set((state) => ({
      exportState: { ...state.exportState, fps },
    }))
  },
}))
