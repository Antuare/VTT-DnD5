/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vtt: {
          black: '#09090b',
          panel: '#121214',
          surface: '#1c1c1f',
          border: '#27272a',
          active: '#3f3f46',
          gold: '#d4af37',
          amber: '#f59e0b',
          success: '#10b981',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        epic: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
