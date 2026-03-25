import React, { useState } from 'react'
import type { ImageAsset } from '@/types'
import { useStore } from '@/store/useStore'

interface Props {
  image: ImageAsset
  index: number
  isSelected: boolean
  isDragging: boolean
  onDragStart: (index: number) => void
  onDragEnter: (index: number) => void
  onDragEnd: () => void
  onClick: () => void
}

export function ThumbnailItem({
  image,
  index,
  isSelected,
  isDragging,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onClick,
}: Props) {
  const { removeImage, setImageDuration } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [durationInput, setDurationInput] = useState(String(image.duration))

  const handleDurationBlur = () => {
    const val = parseFloat(durationInput)
    if (!isNaN(val)) setImageDuration(image.id, val)
    else setDurationInput(String(image.duration))
    setIsEditing(false)
  }

  return (
    <div
      className={`thumbnail-item group no-select
        ${isSelected ? 'selected' : ''}
        ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={image.objectUrl}
        alt={image.name}
        className="w-full h-full object-cover pointer-events-none"
        loading="lazy"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Index badge */}
      <div className="absolute top-1 left-1">
        <span className="text-2xs font-mono bg-black/60 text-ink-secondary px-1.5 py-0.5 rounded">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Delete button — shows on hover */}
      <button
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center
                   rounded bg-black/60 text-ink-muted opacity-0 group-hover:opacity-100
                   hover:text-accent-red transition-opacity duration-150"
        onClick={(e) => { e.stopPropagation(); removeImage(image.id) }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Duration label at bottom */}
      <div className="absolute bottom-1 left-1 right-1">
        {isEditing ? (
          <input
            autoFocus
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            onBlur={handleDurationBlur}
            onKeyDown={(e) => { if (e.key === 'Enter') handleDurationBlur() }}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-2xs font-mono text-center bg-black/80 border border-accent-gold/60
                       text-accent-gold rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <div
            className="text-2xs font-mono text-center text-ink-secondary cursor-text
                       hover:text-accent-gold transition-colors duration-150"
            onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
          >
            {image.duration.toFixed(1)}s
          </div>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-accent-gold rounded-studio pointer-events-none" />
      )}
    </div>
  )
}
