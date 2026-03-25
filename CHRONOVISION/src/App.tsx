import React from 'react'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { RightPanel } from '@/components/layout/RightPanel'

export default function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-studio-bg">
      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-5
                         bg-studio-panel border-b border-studio-border shadow-studio-sm z-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-7 h-7 rounded-studio bg-gradient-gold flex items-center justify-center shadow-gold-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#08080e" strokeWidth="2"/>
              <path d="M12 7v5l3 3" stroke="#08080e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold tracking-tight text-ink-primary">
              READY <span className="text-gradient-gold">VIDEO AI</span>
            </span>
            <span className="text-2xs font-mono text-ink-disabled border border-studio-border
                             px-1.5 py-0.5 rounded">v1.0</span>
          </div>
        </div>

        {/* Center tagline */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <p className="text-2xs text-ink-muted tracking-widest uppercase">
            In-Browser · Cinematic Video Builder
          </p>
        </div>

        {/* Right status chips */}
        <div className="flex items-center gap-2">
          <StatusChip label="WebGL" color="green" />
          <StatusChip label="WebAssembly" color="cyan" />
          <StatusChip label="9:16 Output" color="gold" />
        </div>
      </header>

      {/* ── Split View ─────────────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        <LeftPanel />
        <RightPanel />
      </main>
    </div>
  )
}

// ── Local chip component ──────────────────────────────────────────────────
function StatusChip({ label, color }: { label: string; color: 'green' | 'cyan' | 'gold' }) {
  const colorMap = {
    green: 'text-accent-green border-accent-green/30 bg-accent-green/10',
    cyan:  'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
    gold:  'text-accent-gold border-accent-gold/30 bg-accent-gold-glow',
  }

  return (
    <span className={`text-2xs font-mono px-2 py-0.5 rounded border ${colorMap[color]}`}>
      {label}
    </span>
  )
}
