import React from 'react'
import { ImageUploader } from '@/components/upload/ImageUploader'
import { AudioUploader } from '@/components/upload/AudioUploader'
import { Timeline } from '@/components/timeline/Timeline'
import { EffectSelector } from '@/components/controls/EffectSelector'
import { useStore } from '@/store/useStore'

export function LeftPanel() {
  const isRendering = useStore((s) =>
    s.exportState.status === 'capturing' || s.exportState.status === 'encoding'
  )

  return (
    <div
      className="h-full flex flex-col bg-studio-panel border-r border-studio-border overflow-hidden relative"
      style={{ width: '40%', minWidth: '320px', maxWidth: '480px' }}
    >
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 py-3.5 border-b border-studio-border flex items-center gap-2.5">
        <div className="w-1 h-4 rounded bg-gradient-gold" />
        <span className="text-xs font-semibold tracking-wide text-ink-primary">Studio</span>
        <span className="text-2xs font-mono text-ink-disabled ml-auto">40% ← → 60%</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <section className="px-4 py-4 border-b border-studio-border flex flex-col gap-3">
          <ImageUploader />
          <AudioUploader />
        </section>

        <section className="px-4 py-4 border-b border-studio-border">
          <EffectSelector />
        </section>

        <section className="px-4 py-4">
          <Timeline />
        </section>
      </div>

      {/* Panel footer */}
      <div className="flex-shrink-0 px-4 py-2.5 border-t border-studio-border">
        <p className="text-2xs text-ink-disabled text-center">
          READY VIDEO AI · In-browser render · No server upload
        </p>
      </div>

      {/* ── Lock overlay — covers ENTIRE panel during render ──────────────
          Đặt ở level panel (không phải trong scroll) để che toàn bộ
          kể cả khi user scroll xuống dưới                                */}
      {isRendering && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 select-none cursor-not-allowed"
          style={{ background: 'rgba(8,8,14,0.78)', backdropFilter: 'blur(2px)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="1.5" className="text-ink-muted">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
          </svg>
          <p className="text-xs text-ink-muted text-center leading-snug">
            Locked during render
          </p>
          <p className="text-2xs text-ink-disabled text-center leading-snug px-8">
            Cancel the render to make changes
          </p>
        </div>
      )}
    </div>
  )
}
