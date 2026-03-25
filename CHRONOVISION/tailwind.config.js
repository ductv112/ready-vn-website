/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Studio dark palette — cinematic amber/gold accents
        studio: {
          bg:      '#08080e',   // deepest background
          panel:   '#0f0f18',   // side panels
          card:    '#16161f',   // card surfaces
          elevated:'#1e1e2a',   // modals, popovers
          border:  '#252535',   // subtle dividers
          hover:   '#2a2a3d',   // hover states
          input:   '#1a1a28',   // form inputs
        },
        accent: {
          gold:    '#f0a500',   // primary CTA, active states
          'gold-dim': '#b87a00',
          'gold-glow': 'rgba(240,165,0,0.15)',
          violet:  '#7c3aed',   // secondary accent
          cyan:    '#0ea5e9',   // info/link
          red:     '#ef4444',   // danger
          green:   '#22c55e',   // success
        },
        ink: {
          // Text scale
          primary:   '#f1f1f8',
          secondary: '#9191b0',
          muted:     '#5a5a78',
          disabled:  '#3a3a52',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      backgroundImage: {
        'gradient-studio': 'linear-gradient(135deg, #0f0f18 0%, #12121e 100%)',
        'gradient-gold':   'linear-gradient(135deg, #f0a500 0%, #c47d00 100%)',
        'gradient-canvas': 'linear-gradient(180deg, #08080e 0%, #0c0c16 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'studio-sm':  '0 1px 3px rgba(0,0,0,0.4)',
        'studio-md':  '0 4px 12px rgba(0,0,0,0.5)',
        'studio-lg':  '0 8px 32px rgba(0,0,0,0.6)',
        'gold':       '0 0 20px rgba(240,165,0,0.25)',
        'gold-sm':    '0 0 8px rgba(240,165,0,0.15)',
        'inset-top':  'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      borderRadius: {
        'studio': '8px',
        'studio-lg': '12px',
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':     'spin 8s linear infinite',
        'fade-in':       'fadeIn 0.3s ease forwards',
        'slide-up':      'slideUp 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        'shimmer':       'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        shimmer:  { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
}
