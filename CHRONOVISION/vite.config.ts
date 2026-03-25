import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// FFmpeg.wasm yêu cầu SharedArrayBuffer → cần COOP/COEP headers
// FFmpeg core files được copy từ node_modules vào public/ffmpeg-core/
// để phục vụ offline và tránh phụ thuộc CDN
export default defineConfig({
  base: '/video-ai/',
  plugins: [
    react(),
    // Tự động copy ffmpeg-core.js + .wasm từ node_modules vào build output
    // Chạy cả lúc dev (copy vào .vite/deps) lẫn lúc build (copy vào dist/)
    viteStaticCopy({
      // ESM build — worker uses dynamic import() which needs ESM .default export
      targets: [
        { src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js',   dest: 'ffmpeg-core' },
        { src: 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm', dest: 'ffmpeg-core' },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  // Header cho vite preview (production build local test)
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
})
