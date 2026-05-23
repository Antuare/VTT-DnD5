# 📋 DIAGNÓSTICO COMPLETO DEL REPOSITORIO VTT-DnD5

**Fecha del análisis:** 2024
**Analista:** Sistema Automatizado de Revisión de Código

---

## 🔍 RESUMEN EJECUTIVO

Este documento contiene un análisis exhaustivo del repositorio VTT-DnD5, identificando problemas críticos, errores funcionales, inconsistencias y áreas de mejora. Los problemas están organizados por nivel de prioridad desde lo más peligroso hasta lo menos prioritario.

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### NIVEL 1: CRÍTICOS (Peligro Inminente - El sistema no funciona)

#### 1.1 **Falta el módulo MyVtt.Accounts.User** 🔴
- **Ubicación:** `lib/my_vtt/tables/player.ex` línea 19
- **Problema:** El schema `Player` referencia `belongs_to :user, MyVtt.Accounts.User` pero este módulo no existe en el repositorio.
- **Impacto:** Las migraciones fallarán al crear la foreign key, las consultas a Players fallarán, el sistema de usuarios es inexistente.
- **Solución:** 
  ```elixir
  # Opción A: Crear el módulo Accounts.User
  # lib/my_vtt/accounts/user.ex
  defmodule MyVtt.Accounts.User do
    use Ecto.Schema
    import Ecto.Changeset

    @primary_key {:id, :binary_id, autogenerate: true}
    schema "users" do
      field :email, :string
      field :username, :string
      timestamps(type: :utc_datetime)
    end
  end

  # Opción B: Eliminar la relación user_id temporalmente
  # En player.ex cambiar:
  # belongs_to :user, MyVtt.Accounts.User, type: :binary_id
  # Por:
  field :user_id, :binary_id  # Solo como campo, sin relación
  ```

#### 1.2 **Migración de Players tiene foreign key inválida** 🔴
- **Ubicación:** `priv/repo/migrations/*_create_players.exs`
- **Problema:** La migración crea `references(:users, type: :binary_id)` pero la tabla `users` no existe.
- **Impacto:** `mix ecto.migrate` fallará con error de foreign key.
- **Solución:**
  ```elixir
  # En la migración de players, hacer user_id nullable y sin foreign key
  add :user_id, :binary_id, null: true
  # O crear primero la migración de users
  ```

#### 1.3 **Repo.init/2 incorrectamente implementado** 🔴
- **Ubicación:** `lib/my_vtt/repo.ex`
- **Problema:** La función `init/2` devuelve solo `:database` pero debería devolver `{:ok, keyword_list}` con toda la configuración.
- **Código actual:**
  ```elixir
  def init(_type, _opts) do
    {:ok, Keyword.put([], :database, System.get_env("DATABASE_URL"))}
  end
  ```
- **Impacto:** La configuración de database en config.exs se sobrescribe incorrectamente.
- **Solución:**
  ```elixir
  def init(_type, opts) do
    {:ok, Keyword(opts, :database, Application.get_env(:my_vtt, MyVtt.Repo)[:database])}
  end
  # O simplemente eliminar esta función y dejar que config.exs maneje todo
  ```

#### 1.4 **GameState usa hardcodeado "table:main"** 🔴
- **Ubicación:** `lib/my_vtt/game_state.ex` líneas 89, 93, 97
- **Problema:** Todas las funciones de broadcast usan `"table:main"` en lugar del `table_id` dinámico.
- **Impacto:** Las actualizaciones no llegan a las mesas correctas en un entorno multi-mesa.
- **Solución:**
  ```elixir
  defp broadcast_token_update(action, token, table_id) do
    Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:#{table_id}", {:token_update, payload})
  end
  ```

#### 1.5 **TableChannel no está registrado en el Endpoint correctamente** 🟠
- **Ubicación:** `lib/my_vtt_web/endpoint.ex` línea 9
- **Problema:** `socket "/channel", MyVttWeb.TableChannel` usa sintaxis antigua de Phoenix Channels.
- **Impacto:** Los canales pueden no conectarse correctamente desde el frontend.
- **Solución:**
  ```elixir
  socket "/channel", MyVttWeb.TableChannel, websocket: [connect_info: [session: @session_options]]
  ```

---

### NIVEL 2: ALTOS (Funcionalidad Rota o Incompleta)

#### 2.1 **React Canvas Hook importa componentes que no existen** 🔴
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
- **Ubicación:** `lib/my_vtt_web/live/table_live.ex` líneas 49-77
- **Problema:** Cuando no hay slug, intenta redirigir pero puede crear bucles infinitos si no hay mesas.
- **Impacto:** Posible loop de redirección en la página principal.
- **Solución:** Agregar protección contra redirecciones cíclicas.

#### 2.4 **player.ex tiene validación de color muy estricta** 🟡
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

#### 2.5 **No hay sistema de autenticación real** 🟠
- **Ubicación:** `lib/my_vtt_web/live/table_live.ex` líneas 379-391
- **Problema:** `get_user_id/1` genera IDs temporales aleatorios que se pierden al cerrar sesión.
- **Impacto:** Los jugadores pierden su identidad y rol al recargar la página.
- **Solución:** Implementar sistema de sesiones persistente o autenticación real.

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

## 📊 ESTADÍSTICAS DEL CÓDIGO

| Métrica | Valor |
|---------|-------|
| Archivos Elixir (.ex) | ~15 |
| Archivos Elixir Script (.exs) | ~6 |
| Archivos TypeScript (.ts) | ~3 |
| Archivos TSX React (.tsx) | ~5 |
| Migraciones | 4 |
| Líneas de código totales (estimado) | ~3500 |

---

## ✅ PUNTOS FUERTES DEL PROYECTO

1. ✅ **Arquitectura Phoenix bien estructurada** - Sigue convenciones estándar
2. ✅ **Separación Backend/Frontend clara** - Phoenix + React/PixiJS
3. ✅ **Uso de LiveView para UI dinámica** - Buen uso de tecnología moderna
4. ✅ **Base de datos SQLite3 ligera** - Bueno para desarrollo y despliegue simple
5. ✅ **Migraciones bien definidas** - Schema claro para tablas principales
6. ✅ **PubSub para tiempo real** - Correcta implementación de WebSockets
7. ✅ **Hooks de React modulares** - Separación de concerns en frontend

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### Fase 1 - Crítico (Hacer YA)
1. [ ] Crear módulo `MyVtt.Accounts.User` o eliminar relación
2. [ ] Fixear migración de players
3. [ ] Corregir `Repo.init/2`
4. [ ] Fixear broadcasts de GameState para multi-mesa

### Fase 2 - Alto (Esta semana)
5. [ ] Verificar imports de componentes React
6. [ ] Mejorar manejo de errores en canales
7. [ ] Fixear redirección en TableLive
8. [ ] Relajar validación de colores hex

### Fase 3 - Medio (Próximo sprint)
9. [ ] Decidir sobre GameState (eliminar o refactorizar)
10. [ ] Implementar sistema de autenticación real
11. [ ] Agregar tests básicos
12. [ ] Implementar validación de permisos

### Fase 4 - Bajo (Mejora continua)
13. [ ] Expandir README.md
14. [ ] Agregar .env.example
15. [ ] Estructurar mejor los logs
16. [ ] Documentar API del canal
17. [ ] Refactorizar componentes grandes
18. [ ] Crear docker-compose.yml

---

## 🔧 COMANDOS ÚTILES PARA DEBUGGING

```bash
# Ejecutar diagnóstico completo
./diagnostic.sh

# Verificar compilación Elixir
mix compile --warnings-as-errors

# Verificar typescript
cd assets && npx tsc --noEmit

# Correr tests (cuando existan)
mix test

# Limpiar y reconstruir
mix clean && mix deps.clean --all && mix setup
```

---

## 📝 NOTAS ADICIONALES

- El proyecto usa **Phoenix 1.7.10** (verificar compatibilidad con features más recientes)
- **SQLite3** es bueno para desarrollo pero considerar PostgreSQL para producción
- El frontend usa **React 18** con **PixiJS 7** para renderizado de canvas
- La comunicación en tiempo real usa **Phoenix Channels** vía WebSockets

---

**Fin del Diagnóstico**

*Última actualización: 2024*
