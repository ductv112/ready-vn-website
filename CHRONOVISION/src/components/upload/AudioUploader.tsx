import React, { useCallback, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const { audio, setAudio, removeAudio } = useStore()

  const handleFile = useCallback(
    (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      if (!['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac'].includes(file.type)) return
      setAudio(file)
    },
    [setAudio],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFile(e.dataTransfer.files)
  }

  // Loaded state
  if (audio) {
    return (
      <div>
        <span className="section-label block mb-2">Audio Track</span>
        <div className="card-studio p-3 flex items-center gap-3 inset-highlight">
          {/* Waveform icon */}
          <div className="w-8 h-8 rounded bg-accent-gold/10 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent-gold">
              <path d="M3 12h2l2-6 2 12 2-9 2 6 2-3h4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-ink-primary truncate">{audio.name}</p>
            <p className="text-2xs text-ink-muted">{formatDuration(audio.duration)}</p>
          </div>

          <button
            onClick={removeAudio}
            className="w-6 h-6 flex items-center justify-center rounded text-ink-muted
                       hover:text-accent-red hover:bg-accent-red/10 transition-colors duration-150"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <span className="section-label block mb-2">Audio Track</span>
      <div
        className={`drop-zone p-3 flex items-center gap-3 cursor-pointer
          ${isDragOver ? 'drag-over' : 'hover:border-studio-hover hover:bg-studio-hover/30'}`}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
      >
        <div className="w-8 h-8 rounded border border-dashed border-studio-border flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <div>
          <p className="text-xs text-ink-secondary">Add background music</p>
          <p className="text-2xs text-ink-muted">MP3, WAV, AAC</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/aac"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  )
}
