# MyVtt - Virtual Table Top para DnD 5e

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Elixir](https://img.shields.io/badge/elixir-~%3E%201.14-blueviolet)
![Phoenix](https://img.shields.io/badge/phoenix-~%3E%201.7.10-green)
![License](https://img.shields.io/badge/license-Apache%202.0-red)

</div>

## Descripción

MyVtt es una plataforma de tabla virtual (VTT) diseñada específicamente para jugar Dungeons & Dragons 5ta Edición. Construida con **Phoenix Framework** y **Elixir**, ofrece una experiencia de juego en tiempo real con soporte multijugador.

## ✨ Características Principales

### Backend (Phoenix/Elixir)
- 🎲 **Sistema de dados integrado** - Soporte completo para tiradas de dados DnD 5e
- 💬 **Chat en tiempo real** - Comunicación instantánea entre jugadores
- 👤 **Gestión de cuentas** - Autenticación segura con bcrypt
- 📊 **Fichas de personaje** - Sistema completo de gestión de personajes
- ⚔️ **Combate** - Tracker de combate y gestión de iniciativas
- 🔌 **Phoenix Channels** - Comunicación en tiempo real para multijugador
- 💾 **SQLite3** - Base de datos ligera y portable

### Frontend (React + TypeScript)
- 🎨 **Interfaz moderna** - Diseño responsive con Tailwind CSS
- 🎮 **Estilo HUD** - Interfaz oscura estilo videojuego
- 🎯 **Canvas interactivo** - Renderizado 2D con PixiJS
- 📱 **Responsive** - Adaptable a diferentes dispositivos
- 🔔 **Notificaciones visuales** - Feedback inmediato de acciones

## 🏗️ Arquitectura del Proyecto

```
my_vtt/
├── lib/
│   ├── my_vtt/           # Lógica de negocio principal
│   │   ├── accounts/     # Gestión de usuarios y autenticación
│   │   ├── tables/       # Gestión de mesas de juego
│   │   ├── game_state.ex # Estado del juego
│   │   └── health_monitor.ex # Monitor de salud del sistema
│   └── my_vtt_web/       # Capa web Phoenix
│       ├── channels/     # Phoenix Channels para tiempo real
│       ├── components/   # Componentes LiveView
│       ├── live/         # Módulos LiveView
│       ├── auth.ex       # Autenticación web
│       └── router.ex     # Enrutamiento
├── assets/               # Frontend principal (TypeScript/React)
│   ├── js/
│   │   ├── components/   # Componentes React
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── DiceOverlay.tsx
│   │   │   └── SidebarTools.tsx
│   │   ├── canvas/       # Lógica del canvas PixiJS
│   │   └── hooks/        # Custom React hooks
│   └── css/              # Estilos Tailwind CSS
├── vtt-dark-engine/      # Motor gráfico alternativo (React/Vite)
│   └── src/
│       └── components/   # Componentes UI del motor
├── config/               # Configuración por entorno
├── priv/
│   ├── repo/             # Migraciones y seeds de Ecto
│   └── static/           # Assets estáticos compilados
└── test/                 # Pruebas ExUnit
```

## 🚀 Instalación Rápida

### Prerrequisitos

- **Elixir** ~> 1.14
- **Erlang/OTP** >= 24.0
- **Node.js** (última versión LTS)
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd my_vtt
```

2. **Instalar dependencias de Elixir**
```bash
mix deps.get
```

3. **Instalar dependencias de Node.js**
```bash
cd assets && npm install && cd ..
```

4. **Configurar la base de datos**
```bash
mix ecto.create
mix ecto.migrate
mix run priv/repo/seeds.exs  # Opcional: datos de ejemplo
```

5. **Compilar assets**
```bash
mix assets.setup
mix assets.build
```

6. **Iniciar el servidor**
```bash
mix phx.server
```

Visita `http://localhost:4000` en tu navegador.

## 🛠️ Comandos Mix Útiles

```bash
# Instalación completa desde cero
mix setup

# Reiniciar base de datos
mix ecto.reset

# Ejecutar pruebas
mix test

# Compilar assets en producción
mix assets.deploy

# Crear release con Burrito
mix release
```

## 🎮 Uso del Script de Inicio

El proyecto incluye un script de inicio interactivo:

```bash
./Start.sh
```

Opciones disponibles:
1. **Instalación completa** - Dependencias + DB + assets + servidor
2. **Solo dependencias** - Instala deps de Elixir y Node.js
3. **Configurar BD** - Crea y migra la base de datos
4. **Compilar assets** - Build del frontend
5. **Iniciar servidor** - Solo arranca Phoenix
6. **Diagnóstico** - Verifica el estado del sistema

Para instalación automática sin interacción:
```bash
./Start.sh --auto
```

## 🧪 Ejecutar Tests

```bash
# Todos los tests
mix test

# Tests específicos
mix test test/my_vtt/accounts_test.exs
mix test test/my_vtt_web/live/

# Con cobertura
mix test --cover
```

## 📦 Producción

### Variables de Entorno

```bash
export DATABASE_URL="sqlite3:///path/to/prod.db"
export SECRET_KEY_BASE="<generar-con-mix-phx.gen.secret>"
export PHX_HOST="tudominio.com"
```

### Build de Producción

```bash
MIX_ENV=prod mix do deps.get, assets.deploy, release
```

### Docker

```bash
docker build -t my_vtt .
docker run -p 4000:4000 my_vtt
```

## 🔧 Configuración

### Archivos de Configuración

- `config/config.exs` - Configuración base
- `config/dev.exs` - Desarrollo (con recarga en vivo)
- `config/test.exs` - Testing
- `config/prod.exs` - Producción

### Personalización

Editar `config/config.exs` para:
- Cambiar puerto del servidor
- Configurar adaptadores de base de datos
- Ajustar niveles de logging
- Configurar gettext para internacionalización

## 🎨 Frontend

### assets/ (Principal)

Usa TypeScript, React, PixiJS y Tailwind CSS:

```bash
cd assets
npm run build      # Compilar
npm run watch      # Modo desarrollo
```

### vtt-dark-engine/ (Alternativo)

Motor gráfico con Vite y React puro:

```bash
cd vtt-dark-engine
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la licencia Apache 2.0 - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

- **Framework**: [Phoenix Framework](https://phoenixframework.org/)
- **Lenguaje**: [Elixir](https://elixir-lang.org/)
- **Frontend**: React, TypeScript, PixiJS, Tailwind CSS
- **Dados**: [@dice-roller/rpg-dice-roller](https://github.com/dice-roller/rpg-dice-roller)
- **Animaciones**: [GSAP](https://greensock.com/gsap/)

## 📞 Soporte y Comunidad

- **Issues**: Reporta bugs en el tracker de GitHub
- **Discusiones**: Para preguntas y propuestas de características
- **Documentación**: `mix docs` para generar documentación local

---

<div align="center">

**¡Que comience la aventura! 🐉🎲**

</div>
