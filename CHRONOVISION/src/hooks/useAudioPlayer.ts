import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'

/**
 * Syncs an HTML <audio> element with Zustand playback state.
 * Seeks audio to match currentTime on play/pause/seek.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { audio, playback } = useStore()

  // Init audio element
  useEffect(() => {
    if (!audio) {
      audioRef.current?.pause()
      audioRef.current = null
      return
    }

    const el = new Audio(audio.objectUrl)
    el.preload = 'auto'
    audioRef.current = el

    return () => {
      el.pause()
      el.src = ''
    }
  }, [audio])

  // Sync play/pause
  useEffect(() => {
    const el = audioRef.current
    if (!el) return

    if (playback.status === 'playing') {
      el.currentTime = playback.currentTime
      el.play().catch(() => {}) // autoplay may be blocked
    } else {
      el.pause()
    }
  }, [playback.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync on seek (when paused)
  useEffect(() => {
    const el = audioRef.current
    if (!el || playback.status === 'playing') return
    el.currentTime = playback.currentTime
  }, [playback.currentTime, playback.status])

  return { audioRef }
}
