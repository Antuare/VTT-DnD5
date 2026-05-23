# 📋 DIAGNÓSTICO COMPLETO DEL REPOSITORIO VTT-DnD5

**Fecha del análisis:** 2024
**Analista:** Sistema Automatizado de Revisión de Código
**Última actualización:** Post-implementación Autenticación (Fases 2-4)

---

## 🔍 RESUMEN EJECUTIVO

Este documento contiene un análisis exhaustivo del repositorio VTT-DnD5, identificando problemas críticos, errores funcionales, inconsistencias y áreas de mejora. Los problemas están organizados por nivel de prioridad desde lo más peligroso hasta lo menos prioritario.

### ⚠️ ESTADO ACTUAL - POST-IMPLEMENTACIÓN

**Las Fases 2, 3 y 4 de autenticación han sido implementadas pero NO TESTEADAS.**  
Todos los componentes listados en esta sección como "RESUELTOS" requieren verificación mediante testing exhaustivo.

---

## ✅ PROBLEMAS RESUELTOS (REQUIEREN TESTING)

### NIVEL 1: CRÍTICOS - RESUELTOS ✅ (NO TESTEADO ⚠️)

#### ~~1.1~~ **Falta el módulo MyVtt.Accounts.User** ✅ RESUELTO
- **Estado:** IMPLEMENTADO - NO TESTEADO ⚠️
- **Solución aplicada:** 
  - Creado `lib/my_vtt/accounts/user.ex` con schema completo
  - Campos: email, username, password_hash
  - Hashing de contraseñas con Bcrypt
  - Validaciones de unicidad y formato
- **Archivos creados:**
  - `lib/my_vtt/accounts/user.ex`
  - `lib/my_vtt/accounts/session.ex`
  - `lib/my_vtt/accounts.ex` (contexto completo)
  - `priv/repo/migrations/*_create_users.exs`
  - `priv/repo/migrations/*_create_sessions.exs`

#### ~~1.2~~ **Migración de Players tiene foreign key inválida** ✅ RESUELTO
- **Estado:** IMPLEMENTADO - NO TESTEADO ⚠️
- **Solución aplicada:**
  - Migración de users creada antes que players
  - FK correctamente referenciada a tabla users
  - Relación belongs_to/has_many establecida
- **Archivos modificados:**
  - `lib/my_vtt/tables/player.ex` (relación user agregada)
  - Nueva migración para actualizar players existentes

#### ~~1.3~~ **Repo.init/2 incorrectamente implementado** ✅ VERIFICAR
- **Estado:** CONFIGURACIÓN ACTUALIZADA A POSTGRESQL
- **Cambio aplicado:**
  - Migrado de SQLite3 a PostgreSQL
  - Actualizado `lib/my_vtt/repo.ex`
  - Agregado `:postgrex` en dependencias
  - Removido `:ecto_sqlite3`
- **Requiere:** Verificar configuración en `config/dev.exs`

#### ~~1.5~~ **No hay sistema de autenticación real** ✅ RESUELTO
- **Estado:** IMPLEMENTADO - NO TESTEADO ⚠️
- **Solución aplicada:**
  - Sistema completo de registro/login/logout
  - Sesiones persistentes de 30 días
  - Tokens seguros con expiración
  - Auto-limpieza de sesiones expiradas
- **Archivos creados:**
  - `lib/my_vtt_web/auth.ex` (Plug de autenticación)
  - `lib/my_vtt_web/controllers/session_controller.ex`
  - `lib/my_vtt_web/live/user_register_live.ex`
  - `lib/my_vtt_web/live/user_login_live.ex`
  - `assets/js/services/authService.ts`
  - `assets/js/components/LoginForm.tsx`
  - `assets/js/components/RegisterForm.tsx`

#### ~~1.4~~ **GameState usa hardcodeado "table:main"** ⚠️ PENDIENTE DE VERIFICAR
- **Estado:** REQUIERE TESTING
- **Nota:** La implementación de multi-mesa debe verificarse con usuarios reales

---

## 🔐 NUEVAS FUNCIONALIDADES IMPLEMENTADAS (NO TESTEADAS)

### Sistema de Autenticación Completo

#### Backend (Elixir)
| Componente | Estado | Descripción |
|------------|--------|-------------|
| MyVtt.Accounts.User | ✅ Implementado | Schema con email, username, password_hash |
| MyVtt.Accounts.Session | ✅ Implementado | Sesiones con token, expiración 30 días |
| MyVtt.Accounts context | ✅ Implementado | register/1, login/2, logout/1, get_user_by_session_token/1 |
| MyVttWeb.Auth plug | ✅ Implementado | fetch_current_user/2, require_authenticated_user/2 |
| SessionController | ✅ Implementado | create/2 (login), delete/2 (logout) |
| UserRegisterLive | ✅ Implementado | LiveView de registro con validación |
| UserLoginLive | ✅ Implementado | LiveView de login con redirección |

#### Frontend (TypeScript/React)
| Componente | Estado | Descripción |
|------------|--------|-------------|
| authService.ts | ✅ Implementado | login, register, logout, getCurrentUser |
| LoginForm.tsx | ✅ Implementado | Formulario con validación |
| RegisterForm.tsx | ✅ Implementado | Registro con confirmación |
| App.tsx integration | ✅ Implementado | Estado de autenticación global |

#### Migraciones
| Migración | Estado | Tabla |
|-----------|--------|-------|
| *_create_users.exs | ✅ Creada | users (id, email, username, password_hash) |
| *_create_sessions.exs | ✅ Creada | sessions (id, user_id, token, expires_at) |
| *_update_players_add_user_fk.exs | ✅ Creada | players (user_id FK) |

### Sistema de Roles GM/Player

#### Implementación
| Funcionalidad | Estado | Descripción |
|---------------|--------|-------------|
| Rol en Player schema | ✅ Implementado | Campo role: "gm" \| "player" |
| Asignación automática GM | ✅ Implementado | Primer jugador es GM automático |
| Validación en TableChannel | ✅ Implementado | Permisos por rol para acciones |
| Transferencia de rol GM | ✅ Implementado | El GM puede asignar rol a otros |

#### Permisos Implementados
| Acción | GM | Player |
|--------|-----|--------|
| Mover cualquier token | ✅ | ❌ |
| Mover token propio | ✅ | ✅ |
| Crear tokens | ✅ | ❌ |
| Gestionar jugadores | ✅ | ❌ |
| Tirar dados | ✅ | ✅ |
| Chat | ✅ | ✅ |

---

## ⚠️ PROBLEMAS PENDIENTES DE TESTING (CRÍTICO)

### Testing Requerido - Prioridad MÁXIMA 🔴

1. **Flujo de Registro**
   - [ ] Registro de usuario nuevo funciona correctamente
   - [ ] Validación de email único
   - [ ] Validación de username único
   - [ ] Hashing de contraseña correcto
   - [ ] Redirección post-registro

2. **Flujo de Login**
   - [ ] Login con email/password correcto
   - [ ] Login con username/password correcto
   - [ ] Error con credenciales incorrectas
   - [ ] Creación de sesión persistente
   - [ ] Cookie configurada correctamente

3. **Sesiones Persistentes**
   - [ ] Sesión dura 30 días
   - [ ] Token se renueva con actividad
   - [ ] Logout invalida sesión
   - [ ] "Logout everywhere" funciona
   - [ ] Sesiones expiradas se limpian

4. **Sistema de Roles**
   - [ ] Primer jugador recibe rol GM
   - [ ] Segundos jugadores reciben rol Player
   - [ ] GM puede mover cualquier token
   - [ ] Player solo mueve tokens propios
   - [ ] Transferencia de rol GM funciona

5. **Permisos en Canales**
   - [ ] TableChannel valida permisos
   - [ ] Acciones no autorizadas son rechazadas
   - [ ] Mensajes de error apropiados
   - [ ] No hay bypass de seguridad

6. **Integración Frontend-Backend**
   - [ ] LoginForm conecta con backend
   - [ ] RegisterForm conecta con backend
   - [ ] Estado de auth se actualiza
   - [ ] Protected routes funcionan
   - [ ] Logout desde UI funciona

---

## 🎯 PLAN DE ACCIÓN INMEDIATO

### Fase Urgente - Testing (AHORA)
1. [ ] Configurar PostgreSQL y ejecutar migraciones
2. [ ] Probar registro manual de usuario
3. [ ] Probar login y sesión
4. [ ] Probar creación de mesa con usuario autenticado
5. [ ] Probar sistema de roles GM/Player
6. [ ] Probar permisos en movimiento de tokens
7. [ ] Documentar bugs encontrados

### Fase 2 - Corrección (Post-Testing)
8. [ ] Fixear bugs encontrados en testing
9. [ ] Agregar tests automatizados (ExUnit)
10. [ ] Agregar tests de integración para canales
11. [ ] Documentar flujos verificados

### Fase 3 - Producción (Post-Corrección)
12. [ ] Preparar deploy de prueba
13. [ ] Testing con usuarios reales
14. [ ] Monitoreo de errores
15. [ ] Documentación actualizada

---

## ⚠️ PROBLEMAS IDENTIFICADOS (HISTÓRICOS - MAYORÍA RESUELTOS)

### NIVEL 2: ALTOS (Funcionalidad Rota o Incompleta) - VERIFICAR POST-TESTING

#### 2.1 **React Canvas Hook importa componentes que no existen** 🔴
- **Estado:** REQUIERE VERIFICACIÓN
- **Ubicación:** `assets/js/hooks/react_canvas_hook.tsx` líneas 4-7
- **Problema:** Importa `ChatPanel`, `SidebarTools`, `DiceOverlay`, `CharacterSheet` pero estos imports apuntan a rutas relativas que pueden no resolverse correctamente.
- **Verificación necesaria:** Confirmar que los archivos existen en `assets/js/components/`
- **Solución:** Verificar rutas de importación:
  ```typescript
  import ChatPanel from '../components/ChatPanel';
  import SidebarTools from '../components/SidebarTools';
  // etc...
  ```

#### 2.2 **Phoenix Channel join usa slug pero podría fallar** 🟠
- **Estado:** REQUIERE TESTING CON USUARIOS AUTENTICADOS
- **Ubicación:** `lib/my_vtt_web/channels/table_channel.ex` línea 12
- **Problema:** Si `get_table_by_slug/1` retorna `nil`, el canal falla silenciosamente.
- **Impacto:** El frontend puede quedar en estado de "conectando..." infinitamente.
- **Solución:** Agregar logging y mejor manejo de errores:
  ```elixir
  def join("table:" <> table_slug, _payload, socket) do
    case Tables.get_table_by_slug(table_slug) do
      nil ->
        Logger.warning("Intento de unir a mesa inexistente: #{table_slug}")
        {:error, %{reason: "Mesa no encontrada"}}
      # ... resto del código
  end
  ```

#### 2.3 **LiveView TableLive no maneja correctamente el caso sin slug** 🟠
- **Estado:** REQUIERE TESTING
- **Ubicación:** `lib/my_vtt_web/live/table_live.ex` líneas 49-77
- **Problema:** Cuando no hay slug, intenta redirigir pero puede crear bucles infinitos si no hay mesas.
- **Impacto:** Posible loop de redirección en la página principal.
- **Solución:** Agregar protección contra redirecciones cíclicas.

#### 2.4 **player.ex tiene validación de color muy estricta** 🟡
- **Estado:** SIN CAMBIOS
- **Ubicación:** `lib/my_vtt/tables/player.ex` líneas 37-44
- **Problema:** La regex `^#[0-9A-Fa-f]{6}$` no permite colores shorthand de 3 dígitos.
- **Impacto:** Colores válidos como `#FFF` son rechazados.
- **Solución:**
  ```elixir
  def validate_color(changeset, field) do
    validate_change(changeset, field, fn :color, color ->
      case String.match?(color, ~r/^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/) do
        true -> []
        false -> [{field, "must be a valid hex color"}]
      end
    end)
  end
  ```

---

### NIVEL 3: MEDIOS (Mejoras Necesarias)

#### 3.1 **Game_state.ex es redundante con la DB** 🟡
- **Ubicación:** `lib/my_vtt/game_state.ex`
- **Problema:** El módulo GameState duplica funcionalidad ya cubierta por la base de datos.
- **Impacto:** Complejidad innecesaria, posible inconsistencia de datos.
- **Solución:** Eliminar GameState o usarlo solo para caché temporal.

#### 3.2 **No hay tests automatizados** 🟡
- **Ubicación:** Todo el proyecto
- **Problema:** No existe directorio `test/` ni pruebas unitarias.
- **Impacto:** Imposible verificar regresiones automáticamente.
- **Solución:** Crear suite de tests con ExUnit para backend y Jest/Vitest para frontend.

#### 3.3 **Manejo de errores inconsistente en frontend** 🟡
- **Ubicación:** `assets/js/hooks/react_canvas_hook.tsx`
- **Problema:** Los errores se loggean pero no se muestran al usuario.
- **Impacto:** UX pobre cuando algo falla.
- **Solución:** Implementar sistema de notificaciones/toast en el UI.

#### 3.4 **No hay validación de permisos en TableChannel** 🟡
- **Ubicación:** `lib/my_vtt_web/channels/table_channel.ex`
- **Problema:** Cualquier usuario conectado puede mover cualquier token.
- **Impacto:** Problemas de seguridad y juego justo.
- **Solución:** Verificar rol del jugador antes de permitir acciones:
  ```elixir
  def handle_in("move_token", %{token_id: token_id, x: x, y: y}, socket) do
    player = get_player_from_socket(socket)
    if Player.can_move_token?(player, token_id) do
      # Permitir movimiento
    else
      {:reply, {:error, "No tienes permiso"}, socket}
    end
  end
  ```

#### 3.5 **Configuración de esbuild puede fallar** 🟡
- **Ubicación:** `config/config.exs` líneas 34-39
- **Problema:** La configuración de `env` usa `Path.expand` que puede comportarse diferente en distintos OS.
- **Solución:** Simplificar configuración o usar paths absolutos.

---

### NIVEL 4: BAJOS (Optimizaciones y Buenas Prácticas)

#### 4.1 **README.md es insuficiente** 🟢
- **Ubicación:** `README.md`
- **Problema:** El README actual es muy básico y no documenta cómo instalar, configurar o usar el proyecto.
- **Solución:** Expandir con instalación, uso, arquitectura, contribución.

#### 4.2 **No hay .env de ejemplo** 🟢
- **Ubicación:** Raíz del proyecto
- **Problema:** No hay archivo `.env.example` que documente variables de entorno necesarias.
- **Solución:** Crear `.env.example` con:
  ```
  DATABASE_URL=priv/my_vtt.db
  SECRET_KEY_BASE=cambiar_en_produccion
  PHX_SERVER=true
  ```

#### 4.3 **Logs no están estructurados** 🟢
- **Ubicación:** Varios módulos
- **Problema:** Los logs usan `IO.puts` o `Logger.debug` sin estructura.
- **Solución:** Usar Logger con metadata estructurada.

#### 4.4 **No hay documentación de API del canal** 🟢
- **Ubicación:** `lib/my_vtt_web/channels/table_channel.ex`
- **Problema:** No hay documentación clara de qué eventos puede enviar/recibir el cliente.
- **Solución:** Agregar @doc detallado con ejemplos de payloads.

#### 4.5 **Componentes React podrían estar sobrecargados** 🟢
- **Ubicación:** `assets/js/components/*.tsx`
- **Problema:** Algunos componentes son muy grandes (>500 líneas).
- **Solución:** Refactorizar en sub-componentes más pequeños.

#### 4.6 **No hay Docker Compose para desarrollo** 🟢
- **Ubicación:** Raíz
- **Problema:** Solo hay Dockerfile, no hay docker-compose.yml para levantar DB + app juntos.
- **Solución:** Crear docker-compose.yml para desarrollo fácil.

---

## 📊 ESTADÍSTICAS DEL CÓDIGO (ACTUALIZADO)

| Métrica | Valor |
|---------|-------|
| Archivos Elixir (.ex) | ~25 (+10 por autenticación) |
| Archivos Elixir Script (.exs) | ~9 (+3 migraciones nuevas) |
| Archivos TypeScript (.ts) | ~4 (+1 authService) |
| Archivos TSX React (.tsx) | ~7 (+2 LoginForm/RegisterForm) |
| Migraciones | 7 (+3 de autenticación) |
| Líneas de código totales (estimado) | ~5500 (+2000 por autenticación) |

---

## ✅ PUNTOS FUERTES DEL PROYECTO (ACTUALIZADO)

1. ✅ **Arquitectura Phoenix bien estructurada** - Sigue convenciones estándar
2. ✅ **Separación Backend/Frontend clara** - Phoenix + React/PixiJS
3. ✅ **Uso de LiveView para UI dinámica** - Buen uso de tecnología moderna
4. ✅ **Base de datos PostgreSQL** - Robusta para producción
5. ✅ **Migraciones bien definidas** - Schema claro para tablas principales
6. ✅ **PubSub para tiempo real** - Correcta implementación de WebSockets
7. ✅ **Hooks de React modulares** - Separación de concerns en frontend
8. ✅ **Sistema de autenticación completo** - Implementado (pendiente testing) 🔥
9. ✅ **Sistema de roles GM/Player** - Basado en usuarios reales 🔥
10. ✅ **Sesiones persistentes** - 30 días con tokens seguros 🔥

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO (ACTUALIZADO)

### Fase 1 - Crítico (Hacer YA) ✅ COMPLETADO (NO TESTEADO)
1. [x] ~~Crear módulo `MyVtt.Accounts.User`~~ ✅ IMPLEMENTADO
2. [x] ~~Fixear migración de players~~ ✅ IMPLEMENTADO
3. [x] ~~Corregir `Repo.init/2`~~ ✅ MIGRADO A POSTGRESQL
4. [x] ~~Implementar autenticación completa~~ ✅ IMPLEMENTADO
5. [ ] **TESTEAR TODO EL SISTEMA DE AUTENTICACIÓN** 🔴 CRÍTICO

### Fase 2 - Alto (Esta semana) - POST-TESTING
5. [ ] Verificar imports de componentes React
6. [ ] Mejorar manejo de errores en canales
7. [ ] Fixear redirección en TableLive
8. [ ] Relajar validación de colores hex
9. [ ] Documentar bugs encontrados en testing

### Fase 3 - Medio (Próximo sprint)
10. [ ] Decidir sobre GameState (eliminar o refactorizar)
11. [ ] Agregar tests automatizados (ExUnit)
12. [ ] Tests de integración para canales
13. [ ] Refinar validación de permisos

### Fase 4 - Bajo (Mejora continua)
14. [ ] Expandir README.md con guía de autenticación
15. [ ] Agregar .env.example actualizado
16. [ ] Estructurar mejor los logs
17. [ ] Documentar API del canal
18. [ ] Refactorizar componentes grandes
19. [ ] Crear docker-compose.yml

---

## 🔧 COMANDOS ÚTILES PARA DEBUGGING (ACTUALIZADO)

```bash
# Ejecutar diagnóstico completo
./diagnostic.sh

# Verificar compilación Elixir
mix compile --warnings-as-errors

# Verificar typescript
cd assets && npx tsc --noEmit

# Ejecutar migraciones (PostgreSQL)
mix ecto.create
mix ecto.migrate

# Resetear base de datos (cuidado: borra todo)
mix ecto.drop && mix ecto.create && mix ecto.migrate

# Correr tests (cuando existan)
mix test

# Limpiar y reconstruir
mix clean && mix deps.clean --all && mix setup

# Verificar estado de sesiones
iex -S mix
alias MyVtt.Accounts
Accounts.list_sessions()

# Verificar usuarios registrados
iex -S mix
alias MyVtt.Repo
alias MyVtt.Accounts.User
Repo.all(User)
```

---

## 📝 NOTAS ADICIONALES (ACTUALIZADO)

- El proyecto usa **Phoenix 1.7.10** (verificar compatibilidad con features más recientes)
- **PostgreSQL** es ahora la base de datos requerida (migrado desde SQLite3)
- El frontend usa **React 18** con **PixiJS 7** para renderizado de canvas
- La comunicación en tiempo real usa **Phoenix Channels** vía WebSockets
- **NUEVO**: Sistema de autenticación completo implementado (Fases 2-4) ⚠️ NO TESTEADO
- **NUEVO**: Sesiones persistentes de 30 días con tokens seguros
- **NUEVO**: Sistema de roles GM/Player basado en usuarios reales
- **CRÍTICO**: Testing exhaustivo requerido antes de uso en producción

---

**Fin del Diagnóstico**

*Última actualización: 2024 - Post-implementación Autenticación (Fases 2-4)*
*Estado: IMPLEMENTADO - NO TESTEADO ⚠️*
