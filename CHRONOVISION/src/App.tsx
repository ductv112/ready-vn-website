import React, { useState, useEffect } from 'react'
import { LeftPanel } from '@/components/layout/LeftPanel'
import { RightPanel } from '@/components/layout/RightPanel'

export default function App() {
  const [mobileTab, setMobileTab] = useState<'studio' | 'preview'>('studio')
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-studio-bg">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-12 flex items-center justify-between px-4
                         bg-studio-panel border-b border-studio-border shadow-studio-sm z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-studio bg-gradient-gold flex items-center justify-center shadow-gold-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#08080e" strokeWidth="2"/>
              <path d="M12 7v5l3 3" stroke="#08080e" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-bold tracking-tight text-ink-primary">
            READY <span className="text-gradient-gold">VIDEO AI</span>
          </span>
          {isDesktop && (
            <span className="text-2xs font-mono text-ink-disabled border border-studio-border
                             px-1.5 py-0.5 rounded">v1.0</span>
          )}
        </div>

        {isDesktop && (
          <div className="absolute left-1/2 -translate-x-1/2">
            <p className="text-2xs text-ink-muted tracking-widest uppercase">
              In-Browser · Cinematic Video Builder
            </p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {isDesktop ? (
            <>
              <StatusChip label="WebGL" color="green" />
              <StatusChip label="WebAssembly" color="cyan" />
              <StatusChip label="9:16 Output" color="gold" />
            </>
          ) : (
            <StatusChip label="9:16" color="gold" />
          )}
        </div>
      </header>

      {/* ── Mobile Tab Bar ──────────────────────────────────────────────── */}
      {!isDesktop && (
        <div className="flex-shrink-0 flex border-b border-studio-border bg-studio-panel">
          <button
            onClick={() => setMobileTab('studio')}
            className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors duration-150
              ${mobileTab === 'studio'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-ink-muted'}`}
          >
            🎬 Studio
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors duration-150
              ${mobileTab === 'preview'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-ink-muted'}`}
          >
            ▶ Preview
          </button>
        </div>
      )}

      {/* ── Main Content ────────────────────────────────────────────────── */}
      <main className="flex flex-1 overflow-hidden">
        {/* LeftPanel */}
        <div style={{
          display: isDesktop || mobileTab === 'studio' ? 'flex' : 'none',
          width: isDesktop ? undefined : '100%',
          height: '100%',
        }}>
          <LeftPanel isMobile={!isDesktop} />
        </div>

        {/* RightPanel */}
        <div style={{
          display: isDesktop || mobileTab === 'preview' ? 'flex' : 'none',
          flex: isDesktop ? 1 : undefined,
          width: isDesktop ? undefined : '100%',
          height: '100%',
        }}>
          <RightPanel />
        </div>
      </main>
    </div>
  )
}

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
