# VTT-DnD5 - Virtual Tabletop para Dungeons & Dragons 5e

> "Basura de teufel hecha por IA" 🎲⚔️

Un Virtual Tabletop (VTT) moderno y elegante para jugar Dungeons & Dragons 5ª Edición online, construido con las últimas tecnologías web.

## 🚀 Tecnologías Utilizadas

### Frontend
- **TypeScript** - Tipado estático para JavaScript
- **React 18** - Biblioteca de UI para componentes interactivos
- **Vue 3** - Framework progresivo de JavaScript
- **Svelte 4** - Compilador de componentes reactivos
- **Vanilla JS** - JavaScript puro para utilidades

### Gráficos y Renderizado
- **PixiJS 8** - Motor de renderizado 2D acelerado por hardware

### Estilos y UI/UX
- **Tailwind CSS 4** - Framework de utilidades CSS
- **Tailwind Scrollbar Plugin** - Scrollbars personalizables
- **Lucide Icons** - Iconos modernos y elegantes
- **Game-Icon.net** - Iconos específicos para juegos de rol
- **Google Fonts**:
  - Cinzel (títulos y encabezados)
  - Cormorant Garamond (texto fantástico)
  - Inter (UI general)
  - Fira Sans (texto secundario)

### Backend y Tiempo Real
- **Phoenix Framework (Elixir)** - Servidor WebSocket de alto rendimiento
- **Phoenix Channels** - Comunicación en tiempo real

### Build Tools
- **Vite 5** - Build tool ultrarrápido

## 📁 Estructura del Proyecto

```
vtt-dnd5/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes de UI reutilizables
│   │   ├── map/         # Componentes del mapa y canvas
│   │   ├── character/   # Hojas de personaje y estadísticas
│   │   ├── inventory/   # Gestión de inventario
│   │   └── dice/        # Sistema de tiradas de dados
│   ├── hooks/           # Custom hooks (React)
│   ├── store/           # Estado global (Zustand/Pinia)
│   ├── assets/
│   │   ├── images/      # Imágenes y texturas
│   │   ├── fonts/       # Fuentes personalizadas
│   │   └── audio/       # Efectos de sonido y música
│   ├── styles/          # Estilos globales y Tailwind
│   ├── utils/           # Funciones utilitarias
│   ├── types/           # Definiciones TypeScript
│   ├── App.tsx          # Componente principal React
│   ├── main.tsx         # Entry point React
│   ├── main.vue         # Demo Vue
│   └── main.svelte      # Demo Svelte
├── public/              # Archivos estáticos
├── index.html           # HTML principal
├── vite.config.ts       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind
├── tsconfig.json        # Configuración de TypeScript
└── package.json         # Dependencias y scripts
```

## 🎨 Características de UI/UX

### Tema Fantasy Personalizado
- Paleta de colores inspirada en D&D (rojo, dorado, púrpura, pergamino)
- Fuentes temáticas (Cinzel, Cormorant Garamond)
- Animaciones suaves y efectos de brillo mágico
- Scrollbars personalizados estilo fantasy

### Componentes Implementados
- **Botones D&D**: Con efectos hover, gradientes y animaciones
- **Paneles Fantasy**: Bordes ornamentados y texturas de pergamino
- **Dados Interactivos**: Animaciones de tirada y resultados destacados
- **Tarjetas de Personaje**: Estadísticas, barras de vida y hechizos
- **Tracker de Iniciativa**: Orden de turno con resaltado activo
- **Tokens de Mapa**: Arrastrables con selección y tipos diferenciados
- **Barras de Progreso**: Estilizadas para HP, espacios de hechizo, etc.

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Elixir 1.14+ (para el backend Phoenix)

### Instalación

```bash
# Instalar dependencias frontend
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

### Configurar Phoenix Backend

```bash
# En la carpeta del servidor Phoenix
mix deps.get
mix ecto.create
mix ecto.migrate
mix phx.server
```

## 🎲 Funcionalidades Principales

### Para Jugadores
- ✅ Hoja de personaje interactiva
- ✅ Tiradas de dados con animaciones
- ✅ Chat integrado con soporte para rolls
- ✅ Vista de mapa con tokens
- ✅ Gestión de inventario
- ✅ Tracker de iniciativas

### Para Dungeon Masters
- ✅ Herramientas de dibujo en mapa
- ✅ Niebla de guerra (Fog of War)
- ✅ Iluminación dinámica
- ✅ Creación y gestión de NPCs/enemigos
- ✅ Control total del juego
- ✅ Whisper messages a jugadores

## 🔮 Roadmap

### Fase 1 - Core (En progreso)
- [x] Configuración del proyecto
- [x] Sistema de estilos Tailwind personalizado
- [x] Componentes básicos de UI
- [ ] Integración con PixiJS para el mapa
- [ ] Sistema de drag & drop para tokens

### Fase 2 - Multijugador
- [ ] Integración con Phoenix Channels
- [ ] Autenticación de usuarios
- [ ] Salas de juego
- [ ] Sincronización en tiempo real

### Fase 3 - Características Avanzadas
- [ ] Importación desde D&D Beyond
- [ ] Biblioteca de monstruos integrada
- [ ] Sistema de iluminación dinámica
- [ ] Soporte para mapas 3D (opcional)
- [ ] API para módulos y extensiones

## 📝 Notas sobre Game-Icon.net

Los iconos de [game-icon.net](https://game-icon.net/) se pueden descargar y colocar en `src/assets/images/icons/`. Se recomienda:
1. Descargar los iconos en formato SVG
2. Optimizarlos con SVGO
3. Importarlos como componentes React/Vue/Svelte

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Por favor lee las guías de contribución antes de enviar un PR.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**Hecho con ❤️ para la comunidad de D&D**
