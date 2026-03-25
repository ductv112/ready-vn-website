import React from 'react'
import { useStore } from '@/store/useStore'

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4.75a.75.75 0 0 1 1.18-.614l12 7.25a.75.75 0 0 1 0 1.228l-12 7.25A.75.75 0 0 1 6 19.25V4.75z"/>
    </svg>
  )
}

function IconPause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h3v16H6zM15 4h3v16h-3z"/>
    </svg>
  )
}

function IconRestart() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>
  )
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

interface Props {
  disabled?: boolean
}

export function PlaybackControls({ disabled = false }: Props) {
  const { playback, play, pause, resetPlayback, seek, images } = useStore()

  const totalDuration = images.reduce((s, img) => s + img.duration, 0)
  const isPlaying = playback.status === 'playing'
  const hasContent = images.length > 0 && !disabled

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value))
  }

  const togglePlay = () => {
    if (isPlaying) pause()
    else {
      if (playback.currentTime >= totalDuration) resetPlayback()
      play()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Scrubber */}
      <div className="flex items-center gap-2">
        <span className="text-2xs font-mono text-ink-muted w-8 flex-shrink-0">
          {formatTime(playback.currentTime)}
        </span>
        <div className="flex-1 relative">
          <input
            type="range"
            min={0}
            max={totalDuration || 1}
            step={0.01}
            value={playback.currentTime}
            disabled={!hasContent}
            onChange={handleScrub}
            className="w-full h-1 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: totalDuration
                ? `linear-gradient(to right, #f0a500 ${(playback.currentTime / totalDuration) * 100}%, #252535 ${(playback.currentTime / totalDuration) * 100}%)`
                : '#252535'
            }}
          />
        </div>
        <span className="text-2xs font-mono text-ink-muted w-8 flex-shrink-0 text-right">
          {formatTime(totalDuration)}
        </span>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-3">
        {/* Restart */}
        <button
          onClick={resetPlayback}
          disabled={!hasContent}
          className="w-8 h-8 flex items-center justify-center rounded-studio text-ink-secondary
                     hover:text-ink-primary hover:bg-studio-hover transition-colors duration-150
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <IconRestart />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={!hasContent}
          className={`w-10 h-10 flex items-center justify-center rounded-full
                      transition-all duration-200
                      disabled:opacity-30 disabled:cursor-not-allowed
                      ${isPlaying
                        ? 'bg-studio-elevated border border-studio-border text-ink-primary hover:bg-studio-hover'
                        : 'bg-gradient-gold text-studio-bg shadow-gold-sm hover:shadow-gold'
                      }`}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>

        {/* Frame indicator */}
        <div className="w-8 flex items-center justify-center">
          <span className="text-2xs font-mono text-ink-muted">
            {hasContent ? `${playback.currentImageIndex + 1}/${images.length}` : '--'}
          </span>
        </div>
      </div>
    </div>
  )
}
