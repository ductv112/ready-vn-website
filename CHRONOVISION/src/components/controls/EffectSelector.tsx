import React, { useRef, useState } from 'react'
import { useStore } from '@/store/useStore'
import type { EffectType } from '@/types'

const EFFECTS: { type: EffectType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    type: 'crossfade',
    label: 'Crossfade',
    description: 'Hoà tan mượt mà giữa 2 ảnh',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8" cy="12" r="5" opacity="0.6"/>
        <circle cx="16" cy="12" r="5" opacity="0.6"/>
        <path d="M11 9.5c.9.8 1.4 1.6 1.4 2.5s-.5 1.7-1.4 2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    type: 'infinite-zoom',
    label: 'Infinite Zoom',
    description: 'Bay xuyên ảnh — zoom vô tận',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    type: '3d-distortion',
    label: '3D Distortion',
    description: 'Biến dạng sóng ripple khi chuyển cảnh',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 7c2-2 4 2 6 0s4-2 6 0 4 2 6 0" strokeLinecap="round"/>
        <path d="M3 12c2-2 4 2 6 0s4-2 6 0 4 2 6 0" strokeLinecap="round"/>
        <path d="M3 17c2-2 4 2 6 0s4-2 6 0 4 2 6 0" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const PREVIEW_DURATION = 3000

export function EffectSelector() {
  const { effect, setEffect, images, play, pause, resetPlayback } = useStore()
  const [previewingType, setPreviewingType] = useState<EffectType | null>(null)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTypes  = useRef<EffectType[]>([])

  const hasImages   = images.length > 0
  const selectedTypes = effect.types

  // ── Toggle một effect trong danh sách selected ────────────────────────
  const toggleType = (type: EffectType) => {
    const isSelected = selectedTypes.includes(type)
    // Không cho bỏ chọn nếu chỉ còn 1
    if (isSelected && selectedTypes.length === 1) return
    const next = isSelected
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type]
    setEffect({ types: next })
  }

  // ── Xem thử: tạm thời dùng 1 effect, rồi restore ─────────────────────
  const handlePreview = (e: React.MouseEvent, type: EffectType) => {
    e.stopPropagation()
    if (!hasImages) return

    if (timerRef.current) clearTimeout(timerRef.current)

    // Lưu lại danh sách hiện tại, tạm set 1 effect
    savedTypes.current = [...selectedTypes]
    setEffect({ types: [type] })
    setPreviewingType(type)

    resetPlayback()
    play()

    timerRef.current = setTimeout(() => {
      setEffect({ types: savedTypes.current })  // restore
      pause()
      setPreviewingType(null)
    }, PREVIEW_DURATION)
  }

  const isMix = selectedTypes.length > 1

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="section-label">Transition Effect</span>
        <div className="flex items-center gap-1.5">
          {isMix && (
            <span className="text-2xs font-semibold px-1.5 py-0.5 rounded
                             bg-accent-gold/15 text-accent-gold border border-accent-gold/25
                             tracking-wide uppercase">
              Mix {selectedTypes.length}
            </span>
          )}
          {!hasImages && (
            <span className="text-2xs text-ink-disabled">Upload ảnh để xem thử</span>
          )}
        </div>
      </div>

      {/* Mix hint khi chọn nhiều */}
      {isMix && (
        <p className="text-2xs text-ink-muted leading-snug bg-studio-elevated px-2.5 py-2 rounded-studio border border-studio-border">
          Mỗi chuyển cảnh sẽ dùng 1 effect luân phiên theo thứ tự đã chọn.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        {EFFECTS.map((e) => {
          const isSelected  = selectedTypes.includes(e.type)
          const previewing  = previewingType === e.type
          const isLastOne   = isSelected && selectedTypes.length === 1

          return (
            <div
              key={e.type}
              onClick={() => toggleType(e.type)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-studio cursor-pointer
                          select-none transition-all duration-150
                          ${isSelected
                            ? 'bg-accent-gold-glow border border-accent-gold/40 shadow-gold-sm'
                            : 'bg-studio-card border border-studio-border hover:border-studio-hover hover:bg-studio-hover'
                          }`}
            >
              {/* Checkbox indicator */}
              <div
                className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center
                             border transition-all duration-150
                             ${isSelected
                               ? 'bg-accent-gold border-accent-gold'
                               : 'bg-transparent border-studio-border'
                             }`}
                title={isLastOne ? 'Phải chọn ít nhất 1 effect' : undefined}
              >
                {isSelected && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#08080e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Effect icon */}
              <div className={`flex-shrink-0 transition-colors duration-150
                ${isSelected ? 'text-accent-gold' : 'text-ink-muted'}`}>
                {e.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold leading-tight
                  ${isSelected ? 'text-accent-gold' : 'text-ink-primary'}`}>
                  {e.label}
                </p>
                <p className="text-2xs text-ink-muted mt-0.5 leading-tight">{e.description}</p>
              </div>

              {/* Nút Xem thử */}
              <button
                onClick={(ev) => handlePreview(ev, e.type)}
                disabled={!hasImages}
                title={hasImages ? `Xem thử ${e.label} 3 giây` : 'Upload ảnh trước'}
                className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-2xs
                            font-medium transition-all duration-150
                            disabled:opacity-30 disabled:cursor-not-allowed
                            ${previewing
                              ? 'bg-accent-gold text-studio-bg shadow-gold-sm'
                              : isSelected
                                ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30 hover:bg-accent-gold/30'
                                : 'bg-studio-elevated text-ink-muted border border-studio-border hover:text-ink-secondary hover:border-studio-hover'
                            }`}
              >
                {previewing ? (
                  <>
                    <span className="flex gap-0.5 items-center h-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-current rounded-full animate-pulse"
                          style={{ height: `${[8, 12, 8][i]}px`, animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </span>
                    <span>Đang chạy</span>
                  </>
                ) : (
                  <>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4.75a.75.75 0 0 1 1.18-.614l12 7.25a.75.75 0 0 1 0 1.228l-12 7.25A.75.75 0 0 1 6 19.25V4.75z"/>
                    </svg>
                    <span>Thử</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Intensity slider */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-2xs text-ink-muted">Intensity</span>
          <span className="text-2xs font-mono text-ink-secondary">
            {Math.round(effect.intensity * 100)}%
          </span>
        </div>
        <input
          type="range" min={0} max={1} step={0.05}
          value={effect.intensity}
          onChange={(ev) => setEffect({ intensity: parseFloat(ev.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f0a500 ${effect.intensity * 100}%, #252535 ${effect.intensity * 100}%)`
          }}
        />
      </div>

      {/* Transition duration slider */}
      <div className="mt-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-2xs text-ink-muted">Thời gian chuyển cảnh</span>
          <span className="text-2xs font-mono text-ink-secondary">{effect.duration.toFixed(1)}s</span>
        </div>
        <input
          type="range" min={0.2} max={2} step={0.1}
          value={effect.duration}
          onChange={(ev) => setEffect({ duration: parseFloat(ev.target.value) })}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #f0a500 ${((effect.duration - 0.2) / 1.8) * 100}%, #252535 ${((effect.duration - 0.2) / 1.8) * 100}%)`
          }}
        />
      </div>

      {/* FPS info */}
      <div className="mt-1 p-2.5 bg-studio-card border border-studio-border rounded-studio">
        <p className="text-2xs text-ink-muted leading-relaxed">
          <span className="text-ink-secondary font-medium">30fps</span> — chuẩn TikTok/Shorts, file nhỏ, render nhanh
          <br />
          <span className="text-ink-secondary font-medium">60fps</span> — siêu mượt, file to gấp đôi, render lâu hơn
        </p>
      </div>
    </div>
  )
}
