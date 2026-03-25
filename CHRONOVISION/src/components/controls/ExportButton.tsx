import React, { useRef } from 'react'
import { useStore } from '@/store/useStore'
import { useVideoExport } from '@/hooks/useVideoExport'
import type { CanvasRenderer } from '@/engine/CanvasRenderer'
import type * as THREE from 'three'

interface Props {
  rendererRef: React.RefObject<CanvasRenderer | null>
  getTexturesByIndex: (idx: number) => { texA: THREE.Texture | null; texB: THREE.Texture | null }
}

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && window.innerWidth < 1024)

export function ExportButton({ rendererRef, getTexturesByIndex }: Props) {
  const images    = useStore((s) => s.images)
  const setFps    = useStore((s) => s.setFps)
  const videoRef  = useRef<HTMLVideoElement>(null)

  const {
    renderVideo,
    downloadVideo,
    isRendering,
    renderedBlob,
    renderedVideoUrl,
    exportState,
  } = useVideoExport()

  const isMobile    = isMobileDevice()
  const canRender   = images.length > 0 && !isRendering && !isMobile
  const isDone      = exportState.status === 'done' && !!renderedBlob
  const isError     = exportState.status === 'error'

  const handleRender = async () => {
    if (!rendererRef.current) return
    await renderVideo(rendererRef.current, getTexturesByIndex)
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Export Settings ─────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="section-label">Export Settings</span>
        <div className="flex items-center gap-1">
          {([30, 60] as const).map((fps) => (
            <button
              key={fps}
              onClick={() => setFps(fps)}
              disabled={isRendering}
              className={`text-2xs font-mono px-2 py-0.5 rounded transition-colors duration-150
                disabled:opacity-40
                ${exportState.fps === fps
                  ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                  : 'text-ink-muted hover:text-ink-secondary border border-transparent'
                }`}
            >
              {fps}fps
            </button>
          ))}
        </div>
      </div>

      {/* Output spec */}
      <div className="card-studio p-2.5 flex items-center gap-2.5">
        <div className="w-5 h-9 rounded border border-studio-border bg-studio-elevated flex-shrink-0" />
        <div>
          <p className="text-2xs font-semibold text-ink-secondary">1080 × 1920 · 9:16 · H.264</p>
          <p className="text-2xs text-ink-muted">YouTube Shorts / TikTok</p>
        </div>
      </div>

      {/* ── Progress bar (chỉ hiện khi đang render) ─────────────── */}
      {isRendering && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-2xs text-ink-muted">
              {exportState.status === 'capturing' ? 'Capturing frames...' : 'Encoding MP4...'}
            </span>
            <span className="text-2xs font-mono text-accent-gold">{exportState.progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill transition-all duration-150"
              style={{ width: `${exportState.progress}%` }}
            />
          </div>
          {exportState.message && (
            <p className="text-2xs text-ink-disabled font-mono truncate">{exportState.message}</p>
          )}
        </div>
      )}

      {/* ── Video player (hiện sau khi render xong) ──────────────── */}
      {isDone && renderedVideoUrl && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            <span className="text-2xs text-accent-green font-medium">Render hoàn tất</span>
          </div>
          {/* Video preview — tỷ lệ 9:16 */}
          <div className="relative w-full rounded-studio overflow-hidden bg-black"
               style={{ aspectRatio: '9/16', maxHeight: '240px' }}>
            <video
              ref={videoRef}
              src={renderedVideoUrl}
              controls
              loop
              className="w-full h-full object-contain"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      )}

      {/* ── Error message ─────────────────────────────────────────── */}
      {isError && (
        <div className="bg-accent-red/10 border border-accent-red/30 rounded-studio p-2.5">
          <p className="text-2xs text-accent-red leading-relaxed">{exportState.message}</p>
        </div>
      )}

      {/* ── Buttons ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {/* Bắt đầu Render */}
        <button
          onClick={handleRender}
          disabled={!canRender}
          className={`w-full py-2.5 px-4 rounded-studio font-semibold text-sm
                      flex items-center justify-center gap-2 transition-all duration-200
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${canRender ? 'btn-gold' : 'bg-studio-card border border-studio-border text-ink-muted'}`}
        >
          {isRendering ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-studio-bg/40 border-t-studio-bg rounded-full animate-spin" />
              Đang render...
            </>
          ) : isDone ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Render lại
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4.75a.75.75 0 0 1 1.18-.614l12 7.25a.75.75 0 0 1 0 1.228l-12 7.25A.75.75 0 0 1 6 19.25V4.75z"/>
              </svg>
              Bắt đầu Render
            </>
          )}
        </button>

        {/* Mobile warning */}
        {isMobile && (
          <p className="text-center text-2xs text-ink-muted mt-0.5">
            ⚠ Chỉ dành cho máy tính
          </p>
        )}

        {/* Tải xuống MP4 — chỉ active sau khi đã render */}
        <button
          onClick={downloadVideo}
          disabled={!isDone}
          className="w-full py-2 px-4 rounded-studio font-medium text-sm
                     flex items-center justify-center gap-2 transition-all duration-200
                     disabled:opacity-30 disabled:cursor-not-allowed
                     bg-studio-card border border-studio-border text-ink-secondary
                     hover:border-accent-gold/40 hover:text-ink-primary
                     disabled:hover:border-studio-border disabled:hover:text-ink-secondary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Tải xuống MP4
        </button>
      </div>

    </div>
  )
}
