import React, { useCallback, useRef, useState } from 'react'
import { useStore } from '@/store/useStore'

export function ImageUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const addImages = useStore((s) => s.addImages)
  const imageCount = useStore((s) => s.images.length)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      addImages(Array.from(files))
    },
    [addImages],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true) }
  const onDragLeave = () => setIsDragOver(false)

  return (
    <div>
      {/* Section label */}
      <div className="flex items-center justify-between mb-2">
        <span className="section-label">Images</span>
        {imageCount > 0 && (
          <span className="text-2xs font-mono text-ink-muted">
            {imageCount} loaded
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone p-4 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[90px]
          ${isDragOver ? 'drag-over' : 'hover:border-studio-hover hover:bg-studio-hover/30'}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {/* Icon */}
        <div className={`transition-transform duration-200 ${isDragOver ? 'scale-110' : ''}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink-muted">
            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M17.5 14v7M14 17.5h7" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="text-center">
          <p className="text-xs text-ink-secondary leading-tight">
            {isDragOver
              ? 'Drop images here'
              : 'Drop images or click to browse'}
          </p>
          <p className="text-2xs text-ink-muted mt-0.5">JPG, PNG, WebP</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
