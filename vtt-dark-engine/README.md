# VTT Dark Engine

Frontend para Virtual Table Top (VTT) con diseño oscuro estilo videojuego.

## Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Estilos utilitarios
- **PixiJS** - Renderizado 2D (pendiente de integrar)
- **FontAwesome** - Iconos

## Estructura del Proyecto

```
vtt-dark-engine/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes React
│   │   ├── Toolbar.jsx
│   │   ├── TopBar.jsx
│   │   ├── DiceBar.jsx
│   │   ├── CharacterSheet.jsx
│   │   ├── SpellsTab.jsx
│   │   ├── CombatTab.jsx
│   │   └── ChatPanel.jsx
│   ├── App.jsx          # Componente principal
│   ├── main.jsx         # Punto de entrada
│   └── index.css        # Estilos globales
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

## Build

```bash
npm run build
```

## Características

- 🎨 **Tema oscuro** personalizado con colores VTT
- 🎲 **Barra de dados** funcional con tiradas aleatorias
- 💬 **Panel de chat** con historial de mensajes y tiradas
- 📜 **Ficha de personaje** con pestañas (Ficha, Poderes, Combate)
- 🔊 **Efectos de sonido** sintetizados para interacciones
- 📱 **Diseño responsive** con Tailwind CSS
- ✨ **Estilo HUD** con esquinas metálicas decorativas

## Próximos Pasos

1. Integrar PixiJS para el canvas del visor
2. Conectar con Phoenix Channels para multijugador
3. Implementar sistema de fog of war
4. Agregar gestión de tokens y mapas
