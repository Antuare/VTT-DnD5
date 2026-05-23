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
        // Colores VTT Dark Engine
        vtt: {
          black: '#09090b',     // Fondo absoluto sólido (Zinc 950)
          panel: '#121214',     // Paneles oscuros sólidos (Zinc 900 custom)
          surface: '#1c1c1f',   // Componentes internos (botones, items)
          border: '#27272a',    // Bordes cortantes muy finos
          active: '#3f3f46',    // Estados de enfoque/activo
          gold: '#d4af37',      // Dorado antiguo para acentos
          amber: '#f59e0b',     // Alertas / Fuego
          success: '#10b981',   // Estados positivos
          danger: '#ef4444'     // Estados negativos
        },
        // Colores legacy (mantener compatibilidad)
        'bg-primary': '#1a1a2e',
        'bg-secondary': '#16213e',
        'bg-tertiary': '#0f3460',
        'text-primary': '#e8e8e8',
        'text-secondary': '#a0a0a0',
        'accent-color': '#e94560',
        'border-color': '#2a2a4e'
      },
      fontFamily: {
        epic: ['Cinzel', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
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
