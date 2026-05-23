# Configuración de Tailwind CSS para Phoenix

module.exports = {
  content: [
    './js/**/*.tsx',
    './js/**/*.ts',
    '../lib/my_vtt_web/**/*.ex',
    '../lib/my_vtt_web/**/*.heex'
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#1a1a2e',
        'bg-secondary': '#16213e',
        'bg-tertiary': '#0f3460',
        'text-primary': '#e8e8e8',
        'text-secondary': '#a0a0a0',
        'accent-color': '#e94560',
        'border-color': '#2a2a4e'
      },
      animation: {
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' }
        }
      }
    }
  },
  plugins: []
}
