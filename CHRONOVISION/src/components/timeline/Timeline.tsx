import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { ThumbnailItem } from './ThumbnailItem'

export function Timeline() {
  const { images, reorderImages, playback } = useStore()

  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const onDragStart = (index: number) => setDragFrom(index)
  const onDragEnter = (index: number) => setDragOver(index)

  const onDragEnd = () => {
    if (dragFrom !== null && dragOver !== null && dragFrom !== dragOver) {
      reorderImages(dragFrom, dragOver)
    }
    setDragFrom(null)
    setDragOver(null)
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded border border-dashed border-studio-border
                        flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink-disabled">
            <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="14" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="3" y="15" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="14" y="15" width="7" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="text-xs text-ink-muted">No images loaded</p>
        <p className="text-2xs text-ink-disabled mt-1">Upload images above to get started</p>
      </div>
    )
  }

  // Total duration display
  const totalSec = images.reduce((s, img) => s + img.duration, 0)
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="section-label">Timeline</span>
        <div className="flex items-center gap-2 text-2xs text-ink-muted font-mono">
          <span>{images.length} frames</span>
          <span className="text-studio-border">|</span>
          <span>{formatTime(totalSec)}</span>
        </div>
      </div>

      {/* Playback scrubber */}
      {totalSec > 0 && (
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(playback.currentTime / totalSec) * 100}%` }}
          />
        </div>
      )}

      {/* Grid of thumbnails — 3 columns */}
      <div
        className="grid gap-1.5 mt-1"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        {images.map((img, index) => (
          <ThumbnailItem
            key={img.id}
            image={img}
            index={index}
            isSelected={selectedId === img.id}
            isDragging={dragFrom === index}
            onDragStart={onDragStart}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onClick={() => setSelectedId(selectedId === img.id ? null : img.id)}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-2xs text-ink-disabled text-center mt-1">
        Drag to reorder · Click duration to edit
      </p>
    </div>
  )
}
