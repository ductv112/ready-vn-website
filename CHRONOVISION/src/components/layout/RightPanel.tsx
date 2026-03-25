import React from 'react'
import { PreviewCanvas } from '@/components/canvas/PreviewCanvas'

export function RightPanel() {
  return (
    <div
      className="h-full flex flex-col bg-gradient-canvas overflow-hidden"
      style={{ flex: 1 }}
    >
      {/* Panel header */}
      <div className="flex-shrink-0 px-5 py-3.5 border-b border-studio-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-4 rounded bg-accent-violet/80" />
          <span className="text-xs font-semibold tracking-wide text-ink-primary">Preview</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
            <span className="text-2xs text-ink-muted">WebGL</span>
          </div>
          <span className="text-2xs font-mono text-ink-disabled">9:16 · 1080×1920</span>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden">
        <PreviewCanvas />
      </div>
    </div>
  )
}
