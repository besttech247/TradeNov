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
