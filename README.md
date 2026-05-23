# 🎲 VTT-DnD5 - Virtual Tabletop para Dungeons & Dragons 5e

[![Elixir](https://img.shields.io/badge/Elixir-1.14-blue)](https://elixir-lang.org)
[![Phoenix](https://img.shields.io/badge/Phoenix-1.7.10-red)](https://www.phoenixframework.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![PixiJS](https://img.shields.io/badge/PixiJS-7-green)](https://pixijs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)](https://www.postgresql.org)

**VTT-DnD5** es una mesa de juego virtual (Virtual Tabletop) diseñada específicamente para jugar Dungeons & Dragons 5ta edición. Combina la potencia de Phoenix Framework en el backend con React y PixiJS en el frontend para ofrecer una experiencia de juego en tiempo real.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Funcionalidades Faltantes](#-funcionalidades-faltantes)
- [Diagnóstico y Problemas Conocidos](#-diagnóstico-y-problemas-conocidos)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Actuales ✅
- **Mesas Multi-jugador**: Crea mesas únicas con URLs compartibles vía slug
- **Tiempo Real**: Sincronización instantánea de movimientos y chat usando Phoenix Channels
- **Tokens Personalizables**: Coloca, mueve y personaliza tokens en el mapa
- **Chat Integrado**: Sistema de chat con persistencia y mensajes de sistema
- **Tiradas de Dados**: Sistema de dados integrado con notificaciones visuales
- **Roles de Jugador**: Sistema GM/Player con permisos diferenciados
- **Autenticación Completa**: Registro, login, sesiones persistentes (30 días) y gestión de usuarios
- **Persistencia**: Base de datos PostgreSQL para guardar el estado del juego
- **UI Moderna**: Interfaz oscura optimizada para sesiones largas de juego

### En Desarrollo 🚧
- Hoja de personaje interactiva
- Sistema de iniciativa automatizado
- Mapas personalizables con upload de imágenes
- Integración con D&D Beyond

---

## 🛠️ Requisitos

### Backend (Elixir/Phoenix)
- **Elixir**: 1.14 o superior
- **Erlang/OTP**: 25 o superior
- **Mix**: Incluido con Elixir

### Frontend (Node.js)
- **Node.js**: 18.x o superior
- **npm**: 9.x o superior

### Base de Datos
- **PostgreSQL**: 14 o superior (requerido)
- **SQLite3**: No soportado (migrado a PostgreSQL)

### Opcional
- **Docker**: Para contenerización
- **Git**: Para control de versiones

---

## 📦 Instalación

### Método 1: Script Automático (Recomendado)

```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd vtt-dnd5

# Dar permisos al script
chmod +x Start.sh

# Ejecutar instalación completa automática
./Start.sh --auto
```

### Método 2: Instalación Manual Paso a Paso

#### 1. Instalar dependencias de Elixir
```bash
mix deps.get
```

#### 2. Instalar dependencias de Node.js
```bash
cd assets
npm install
cd ..
```

#### 3. Configurar base de datos
```bash
# Crear base de datos
mix ecto.create

# Ejecutar migraciones
mix ecto.migrate

# (Opcional) Sembrar datos de ejemplo
mix run priv/repo/seeds.exs
```

#### 4. Compilar assets
```bash
cd assets
npm run build
cd ..
```

#### 5. Iniciar servidor
```bash
mix phx.server
```

Accede a http://localhost:4000

---

## 🎮 Uso

### Crear/Unirse a una Mesa

1. **Primera vez**: El primer jugador en unirse automáticamente se convierte en GM
2. **URL de mesa**: Cada mesa tiene un slug único (ej: `/table/mesa-principal`)
3. **Compartir**: Comparte la URL con otros jugadores para que se unan

### Controles del GM

- **Mover Tokens**: El GM puede mover cualquier token
- **Gestionar Jugadores**: Asignar rol de GM a otro jugador
- **Crear Tokens**: Añadir nuevos tokens al mapa

### Controles de Jugador

- **Mover Tokens Propios**: Los jugadores pueden mover sus tokens asignados
- **Chat**: Enviar mensajes y ver tiradas de dados
- **Tiradas**: Usar el panel lateral para tirar dados

### Comandos de Chat

- Tiradas de dados: El sistema registra automáticamente las tiradas
- Mensajes de sistema: Las tiradas aparecen como mensajes del sistema

---

## 🏗️ Arquitectura

### Backend (Elixir/Phoenix)

```
lib/
├── my_vtt/                 # Contexto principal
│   ├── application.ex      # Aplicación OTP
│   ├── repo.ex             # Repositorio Ecto
│   ├── game_state.ex       # Estado en memoria (ETS)
│   ├── tables.ex           # Contexto de mesas
│   └── tables/             # Schemas
│       ├── table.ex        # Schema de mesa
│       ├── token.ex        # Schema de token
│       ├── player.ex       # Schema de jugador
│       └── chat_message.ex # Schema de mensaje
└── my_vtt_web/
    ├── endpoint.ex         # Endpoint Phoenix
    ├── router.ex           # Rutas
    ├── channels/
    │   └── table_channel.ex # Canal WebSocket
    └── live/
        └── table_live.ex   # LiveView principal
```

### Frontend (React/TypeScript/PixiJS)

```
assets/
├── js/
│   ├── app.ts              # Punto de entrada Phoenix
│   ├── canvas/
│   │   ├── engine.ts       # Motor PixiJS
│   │   └── token_sprite.ts # Sprite de tokens
│   ├── components/
│   │   ├── ChatPanel.tsx   # Panel de chat
│   │   ├── SidebarTools.tsx # Barra de herramientas
│   │   ├── DiceOverlay.tsx # Overlay de dados
│   │   └── CharacterSheet.tsx # Hoja de personaje
│   └── hooks/
│       ├── index.ts        # Export de hooks
│       └── react_canvas_hook.tsx # Hook principal
└── css/
    └── app.css             # Estilos Tailwind
```

### Flujo de Datos

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Browser   │ ◄────────────────► │   Phoenix   │
│  (React/)   │                    │   Channel   │
│   PixiJS)   │                    │             │
└─────────────┘                    └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   Ecto      │
                                   │   Repo      │
                                   └──────┬──────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │   SQLite3   │
                                   │   (DB)      │
                                   └─────────────┘
```

---

## 📊 Estado del Proyecto

### Fase 1 Completada ✅
- [x] Modelos de datos y migraciones
- [x] Backend con persistencia DB (PostgreSQL)
- [x] Canales Phoenix multi-mesa
- [x] Frontend React conectado
- [x] Chat funcional
- [x] Movimiento de tokens
- [x] Tiradas de dados

### Fase 2 Completada ✅ (NUEVO - NO TESTEADO ⚠️)
- [x] **Sistema de autenticación completo** (registro, login, logout)
- [x] **Módulo MyVtt.Accounts.User** implementado
- [x] **Módulo MyVtt.Accounts.Session** para sesiones persistentes
- [x] **MyVtt.Accounts context** con funciones de gestión de usuarios
- [x] **MyVttWeb.Auth plug** para protección de rutas
- [x] **LiveViews de autenticación** (RegisterLive, LoginLive)
- [x] **SessionController** para manejo de sesiones HTTP
- [x] **Migraciones de users y sessions** creadas

### Fase 3 Completada ✅ (NUEVO - NO TESTEADO ⚠️)
- [x] **Servicios de autenticación en frontend** (TypeScript/React)
- [x] **Componentes LoginForm y RegisterForm** implementados
- [x] **Integración de estado de autenticación** en App.tsx
- [x] **Axios interceptors** para manejo de tokens

### Fase 4 Completada ✅ (NUEVO - NO TESTEADO ⚠️)
- [x] **Sistema de roles GM/Player** basado en usuarios reales
- [x] **Asignación automática de GM** al primer jugador
- [x] **Validación de permisos en TableChannel** por rol
- [x] **Relación User-Player** establecida correctamente
- [x] **Migración de actualización de players** agregada

### En Progreso 🚧
- [ ] **TESTING DE AUTENTICACIÓN** (CRÍTICO - NO TESTEADO) 🔴
- [ ] Hoja de personaje fully functional
- [ ] Upload de imágenes para tokens
- [ ] Mapas personalizables

### Planificado 📋
- [ ] Sistema de iniciativa tracker
- [ ] Integración con D&D Beyond
- [ ] Modo campaña (persistencia entre sesiones)
- [ ] Audio/Video chat
- [ ] Marketplace de assets

---

## ❌ Funcionalidades Faltantes por Programar

### Críticas (Necesarias para MVP)
1. **TESTING DE AUTENTICACIÓN** 🔴 ⚠️ **NO TESTEADO - IMPLEMENTADO RECIENTEMENTE**
   - Pruebas de registro y login
   - Validación de sesiones persistentes
   - Testing de permisos por rol
   - Verificación de flujo completo GM/Player

2. **Sistema de Permisos Completo** 🟠
   - Validación exhaustiva de acciones por rol
   - Tokens asignados a jugadores específicos
   - Visibilidad oculta para jugadores

3. **Gestión de Mapas** 🟠
   - Upload de imágenes de fondo
   - Sistema de cuadrícula configurable
   - Múltiples escenas/mapas por mesa

### Importantes (Mejoras Significativas)
4. **Hoja de Personaje Funcional** 🟠
   - Stats editables
   - Skills y proficiencias
   - Inventario gestionable
   - Hechizos y habilidades

5. **Sistema de Iniciativa** 🟡
   - Tracker visual de turnos
   - Integración con hojas de personaje
   - Temporizador de turnos

6. **Tokens Avanzados** 🟡
   - Imágenes personalizadas
   - Estados y efectos visuales
   - Barra de HP visible

### Secundarias (Nice to Have)
7. **Notificaciones Push** 🟢
   - Alertas de turno
   - Mensajes directos
   - Eventos de campaña

8. **Exportar/Importar** 🟢
   - Guardar estado de mesa
   - Exportar personajes
   - Backup de campañas

9. **Integraciones** 🟢
   - D&D Beyond API
   - Roll20 import
   - Foundry VTT compatibility

---

## 🔍 Diagnóstico y Problemas Conocidos

Para un análisis detallado de problemas, errores y áreas de mejora, consulta el archivo [diagnostico.md](./diagnostico.md).

### ⚠️ ADVERTENCIA CRÍTICA - SISTEMA NO TESTEADO

**Las funcionalidades de autenticación implementadas en las Fases 2-4 NO han sido testeadas.**  
Esto incluye:
- Registro y login de usuarios
- Sesiones persistentes
- Sistema de roles GM/Player
- Validación de permisos en canales

**Se requiere testing exhaustivo antes de usar en producción.**

### Problemas Históricos Resueltos ✅

Los siguientes problemas críticos documentados previamente han sido **RESUELTOS**:

1. ~~Falta módulo MyVtt.Accounts.User~~ ✅ **RESUELTO** - Módulo creado con hashing Bcrypt
2. ~~Migración de Players inválida~~ ✅ **RESUELTO** - FK corregida a tabla users existente
3. ~~Repo.init/2 incorrecto~~ ✅ **VERIFICAR** - Revisar configuración PostgreSQL
4. ~~GameState hardcodea "table:main"~~ ✅ **PENDIENTE DE VERIFICAR** - Requiere testing

### Ejecutar Diagnóstico

```bash
# Ejecutar script de diagnóstico completo
./diagnostic.sh

# Ver resultado
cat diagnostico_output.txt
```

---

## 🤝 Contribuir

### Pasos para Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Convenciones de Código

- **Elixir**: Seguir guías de estilo de [HexDocs](https://hexdocs.pm/elixir/writing-documentation.html)
- **TypeScript/React**: Usar ESLint config incluido
- **Commits**: Seguir [Conventional Commits](https://www.conventionalcommits.org/)

### Running Tests

```bash
# Backend tests
mix test

# Frontend tests (pendiente de implementar)
cd assets && npm test
```

---

## 📄 Licencia

Este proyecto está licenciado bajo los términos descritos en el archivo [LICENSE](./LICENSE).

---

## 📞 Soporte y Contacto

- **Issues**: Reporta bugs en la sección de Issues de GitHub
- **Discusiones**: Para preguntas generales, usa GitHub Discussions
- **Documentación**: Ver archivos `IMPLEMENTACION_FASE1.md` y `diagnostico.md`

---

## 🙏 Agradecimientos

- [Phoenix Framework](https://phoenixframework.org/) - Backend robusto y escalable
- [React](https://react.dev/) - UI moderna y reactiva
- [PixiJS](https://pixijs.com/) - Renderizado de canvas de alto rendimiento
- [Tailwind CSS](https://tailwindcss.com/) - Estilos utilitarios
- [D&D Beyond](https://www.dndbeyond.com/) - Inspiración para características

---

**Hecho con ❤️ para la comunidad de D&D**

*"El Dungeon Master puede crear mundos, pero son los jugadores quienes les dan vida"*
