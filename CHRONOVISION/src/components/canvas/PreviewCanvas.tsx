import React, { useRef } from 'react'
import { useCanvasEngine } from '@/hooks/useCanvasEngine'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { useVideoExport } from '@/hooks/useVideoExport'
import { useStore } from '@/store/useStore'
import { PlaybackControls } from '@/components/controls/PlaybackControls'

const RENDER_W = 1080
const RENDER_H = 1920

export function PreviewCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const { rendererRef, getTexturesByIndex } = useCanvasEngine(canvasRef)
  useAudioPlayer()

  const {
    renderVideo, cancelRender, downloadVideo,
    isRendering, renderedBlob, renderedVideoUrl,
    exportState,
  } = useVideoExport()

  const images  = useStore((s) => s.images)
  const setFps  = useStore((s) => s.setFps)
  const isEmpty = images.length === 0
  const isDone  = exportState.status === 'done' && !!renderedBlob
  const isError = exportState.status === 'error'

  const isMobile = ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth < 1024)
  const canRender = images.length > 0 && !isRendering && !isMobile

  const handleRender = async () => {
    if (!rendererRef.current) return
    await renderVideo(rendererRef.current, getTexturesByIndex)
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', overflow: 'hidden' }}>

      {/* ── Canvas / Video Player ───────────────────────────────────────── */}
      <div style={{
        flex: isMobile ? '0 0 auto' : 1,
        height: isMobile ? '55%' : '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '8px' : '16px',
        overflow: 'hidden', minHeight: 0, minWidth: 0,
      }}>
        {/* Wrapper giữ aspect ratio 9:16 */}
        <div
          className="canvas-wrapper"
          style={{ height: '100%', maxWidth: '100%' }}
        >
          {/* WebGL canvas — ẩn sau khi render xong, nhường chỗ cho video */}
          <canvas
            ref={canvasRef}
            width={RENDER_W}
            height={RENDER_H}
            className="block w-full h-full"
            style={{ display: isDone ? 'none' : 'block', imageRendering: 'auto' }}
          />

          {/* Video player — chỉ hiện khi render xong */}
          {isDone && renderedVideoUrl && (
            <video
              ref={videoRef}
              src={renderedVideoUrl}
              controls
              loop
              autoPlay
              className="block w-full h-full object-contain bg-black"
            />
          )}

          {/* Empty state overlay */}
          {isEmpty && !isRendering && !isDone && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-studio-panel/90">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border border-accent-gold/20 animate-pulse-slow" />
                <div className="absolute inset-2 rounded-full border border-accent-gold/10 animate-pulse-slow"
                     style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-ink-disabled">
                    <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="14" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                    <rect x="3" y="15" width="18" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
              </div>
              <div className="text-center px-6">
                <p className="text-sm font-medium text-ink-secondary">No content loaded</p>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  Upload images in the panel to start building your video
                </p>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <span className="text-2xs font-mono text-ink-disabled bg-black/40 px-2 py-1 rounded">
                  9:16  ·  1080×1920
                </span>
              </div>
            </div>
          )}

          {/* Render overlay — frozen frame + progress indicator */}
          {isRendering && (
            <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center gap-4 pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin" />
                <p className="text-xs font-semibold text-accent-gold tracking-wide">
                  {exportState.status === 'capturing' ? 'Capturing...' : 'Encoding...'}
                </p>
              </div>
              <div className="w-40 flex flex-col items-center gap-1.5">
                <div className="w-full progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${exportState.progress}%` }} />
                </div>
                <span className="text-2xs font-mono text-ink-muted">{exportState.progress}%</span>
              </div>
            </div>
          )}

          {/* Corner decorations */}
          <div className="absolute top-2 left-2 w-4 h-4 border-l border-t border-accent-gold/30 rounded-tl" />
          <div className="absolute top-2 right-2 w-4 h-4 border-r border-t border-accent-gold/30 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-l border-b border-accent-gold/30 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-r border-b border-accent-gold/30 rounded-br" />
        </div>
      </div>

      {/* ── Controls (sidebar on desktop, strip below on mobile) ────────── */}
      <div style={{
        width: isMobile ? '100%' : '256px',
        flex: isMobile ? '1 1 auto' : undefined,
        flexShrink: isMobile ? undefined : 0,
        borderLeft: isMobile ? 'none' : undefined,
        borderTop: isMobile ? '1px solid #1e1e2e' : undefined,
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto',
        background: '#0f0f18',
      }}>

        {/* Export Settings */}
        <section className="px-4 py-4 border-b border-studio-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="section-label">Export</span>
            {/* FPS selector */}
            <div className="flex items-center gap-1">
              {([30, 60] as const).map((fps) => (
                <button
                  key={fps}
                  onClick={() => setFps(fps)}
                  disabled={isRendering}
                  className={`text-2xs font-mono px-2 py-0.5 rounded transition-colors duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed
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
          <div className="flex items-center gap-2 p-2 bg-studio-elevated rounded-studio border border-studio-border">
            <div className="w-4 h-7 rounded border border-studio-border bg-studio-card flex-shrink-0" />
            <div>
              <p className="text-2xs font-semibold text-ink-secondary leading-tight">1080 × 1920 · H.264</p>
              <p className="text-2xs text-ink-muted leading-tight">YouTube Shorts / TikTok</p>
            </div>
          </div>
        </section>

        {/* Playback Controls — ẩn khi video player đang active (có controls riêng) */}
        {!isDone && (
          <section className="px-4 py-4 border-b border-studio-border">
            <span className="section-label block mb-3">Playback</span>
            <PlaybackControls disabled={isRendering} />
          </section>
        )}

        {/* Render section — thay đổi nội dung theo trạng thái */}
        <section className="px-4 py-4 flex flex-col gap-3 flex-1">

          {/* ── Đang render: progress + cancel ── */}
          {isRendering && (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs text-ink-muted font-medium">
                    {exportState.status === 'capturing' ? 'Capturing frames' : 'Encoding MP4'}
                  </span>
                  <span className="text-2xs font-mono text-accent-gold font-semibold">
                    {exportState.progress}%
                  </span>
                </div>
                {/* Progress bar lớn hơn khi render */}
                <div className="h-1.5 bg-studio-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-gold rounded-full transition-all duration-150"
                    style={{ width: `${exportState.progress}%` }}
                  />
                </div>
                {exportState.message && (
                  <p className="text-2xs text-ink-disabled font-mono truncate leading-snug">
                    {exportState.message}
                  </p>
                )}
              </div>

              {/* Cancel button */}
              <button
                onClick={cancelRender}
                className="w-full py-2 px-4 rounded-studio text-sm font-medium
                           flex items-center justify-center gap-2 transition-all duration-200
                           bg-studio-elevated border border-studio-border text-ink-secondary
                           hover:border-accent-red/50 hover:text-accent-red"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round"/>
                </svg>
                Cancel
              </button>
            </>
          )}

          {/* ── Lỗi ── */}
          {isError && (
            <div className="bg-accent-red/10 border border-accent-red/30 rounded-studio p-2.5">
              <p className="text-2xs text-accent-red leading-relaxed">{exportState.message}</p>
            </div>
          )}

          {/* ── Render xong: badge + download ── */}
          {isDone && (
            <div className="flex items-center gap-1.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green flex-shrink-0" />
              <span className="text-2xs text-accent-green font-medium">Render hoàn tất</span>
            </div>
          )}

          {/* ── Nút Render (ẩn khi đang render) ── */}
          {!isRendering && (
            <button
              onClick={handleRender}
              disabled={!canRender}
              className={`w-full py-2.5 px-4 rounded-studio font-semibold text-sm
                          flex items-center justify-center gap-2 transition-all duration-200
                          disabled:opacity-40 disabled:cursor-not-allowed
                          ${canRender ? 'btn-gold' : 'bg-studio-card border border-studio-border text-ink-muted'}`}
            >
              {isDone ? (
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
          )}

          {/* Mobile warning */}
          {isMobile && !isRendering && (
            <p className="text-center text-xs text-ink-muted">
              ⚠ Chỉ dành cho máy tính
            </p>
          )}

          {/* ── Download (chỉ hiện khi done) ── */}
          {isDone && (
            <button
              onClick={downloadVideo}
              className="w-full py-2 px-4 rounded-studio font-medium text-sm
                         flex items-center justify-center gap-2 transition-all duration-200
                         bg-studio-card border border-studio-border text-ink-secondary
                         hover:border-accent-gold/40 hover:text-ink-primary"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tải xuống MP4
            </button>
          )}
        </section>

      </div>
    </div>
  )
}
