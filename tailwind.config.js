/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        jiade: {
          bg: '#f3f4f7',
          card: '#ffffff',
          cardSub: '#f8f9fa',
          border: '#e6e8ec',
          textMain: '#181f39',
          textMuted: '#717579',
          primary: '#3eacff',
        },
        crypto: {
          dark: '#0B0E14',
          card: 'rgba(255, 255, 255, 0.03)',
          cardHover: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#00f0ff',
          green: '#10b981',
          greenBg: 'rgba(16, 185, 129, 0.1)',
          red: '#ef4444',
          redBg: 'rgba(239, 68, 68, 0.1)',
          yellow: '#f59e0b',
          muted: '#8b949e',
        },

        background: { DEFAULT: '#0B0E14', card: '#151924', input: '#1C212D' },
        primary: { DEFAULT: '#00F0FF', hover: '#00D1FF' },
        accent: { DEFAULT: '#7E57C2', hover: '#9575CD' },
        success: { DEFAULT: '#00E676', dim: 'rgba(0, 230, 118, 0.1)' },
        danger: { DEFAULT: '#FF3D00', dim: 'rgba(255, 61, 0, 0.1)' },
        text: { main: '#F8F9FA', muted: '#8B94A5' }
      },
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
