defmodule MyVttWeb.TableLive do
  @moduledoc """
  LiveView que sirve de puente para cargar el HTML base donde React se acopla.
  Ahora carga datos desde la base de datos, soporta múltiples mesas por slug,
  y gestiona jugadores con roles (GM y players).
  """
  
  use MyVttWeb, :live_view
  alias MyVtt.Tables
  alias MyVtt.Tables.Player

  @impl true
  def mount(%{"slug" => slug}, _session, socket) do
    # Buscar la mesa por slug
    case Tables.get_table_by_slug(slug) do
      nil ->
        # Mesa no encontrada, redirigir o mostrar error
        {:ok, 
         socket 
         |> assign(:error, "Mesa no encontrada")
         |> assign(:table, nil)
         |> assign(:players, [])
         |> assign(:current_player, nil), temporary_assigns: [table: nil]}
      
      table ->
        # Suscribirse a actualizaciones de esta mesa
        Phoenix.PubSub.subscribe(MyVtt.PubSub, "table:#{table.id}")
        
        # Cargar datos iniciales
        tokens = Tables.list_tokens(table.id)
        chat_messages = Tables.list_chat_messages(table.id, 50)
        players = Tables.list_players(table.id)
        
        # Obtener el jugador actual si existe en session
        current_player = get_current_player(socket, table.id)
        
        {:ok, 
         socket 
         |> assign(:table, table)
         |> assign(:tokens, tokens)
         |> assign(:chat_messages, chat_messages)
         |> assign(:players, players)
         |> assign(:current_player, current_player)
         |> assign(:error, nil), temporary_assigns: [table: nil]}
    end
  end
  
  # Caso cuando no hay slug (redirigir a mesa por defecto o listar)
  @impl true
  def mount(_params, _session, socket) do
    # Obtener primera mesa activa o crear una por defecto
    case Tables.list_tables() |> Enum.find(& &1.active) do
      nil ->
        # No hay mesas, crear una por defecto
        case Tables.create_table(%{name: "Mesa Principal", active: true}) do
          {:ok, table} ->
            {:ok, 
             socket 
             |> assign(:table, table)
             |> assign(:tokens, [])
             |> assign(:chat_messages, [])
             |> assign(:players, [])
             |> assign(:current_player, nil)
             |> assign(:error, nil)}
          
          {:error, _changeset} ->
            {:ok, 
             socket 
             |> assign(:error, "No se pudo cargar la mesa")
             |> assign(:table, nil)}
        end
      
      table ->
        # Redirigir al slug de la mesa
        Phoenix.LiveView.redirect(socket, to: "/table/#{table.slug}")
    end
  end

  @impl true
  def handle_params(%{"slug" => slug}, _uri, socket) do
    case Tables.get_table_by_slug(slug) do
      nil ->
        {:noreply, assign(socket, :error, "Mesa no encontrada")}
      
      table ->
        {:noreply, 
         socket 
         |> assign(:table, table)
         |> assign(:error, nil)}
    end
  end
  
  @impl true
  def handle_params(_params, _uri, socket) do
    {:noreply, socket}
  end

  # Manejar actualizaciones de tokens desde PubSub
  @impl true
  def handle_info({:token_moved, payload}, socket) do
    # Actualizar token en estado local si es necesario
    # Nota: El frontend maneja esto directamente vía canal, pero podemos mantener consistencia
    {:noreply, socket}
  end

  # Manejar nuevos mensajes de chat desde PubSub
  @impl true
  def handle_info({:chat_message, message}, socket) do
    # Agregar mensaje a la lista local
    chat_messages = socket.assigns[:chat_messages] || []
    {:noreply, assign(socket, :chat_messages, chat_messages ++ [message])}
  end

  # Manejar resultado de dados desde PubSub
  @impl true
  def handle_info({:dice_rolled, result}, socket) do
    # Los dados se manejan vía canal directamente al frontend
    {:noreply, socket}
  end

  # Manejar jugador unido a la mesa
  @impl true
  def handle_info({:player_joined, player}, socket) do
    players = socket.assigns[:players] || []
    {:noreply, assign(socket, :players, players ++ [player])}
  end

  # Manejar jugador salido de la mesa
  @impl true
  def handle_info({:player_left, player_id}, socket) do
    players = socket.assigns[:players] || []
    updated_players = Enum.reject(players, &(&1.id == player_id))
    {:noreply, assign(socket, :players, updated_players)}
  end

  # Manejar actualización de lista de jugadores
  @impl true
  def handle_info({:players_updated, players}, socket) do
    {:noreply, assign(socket, :players, players)}
  end

  # Unirse a la mesa como jugador
  @impl true
  def handle_event("join_table", %{"player_name" => player_name}, socket) do
    table = socket.assigns.table
    
    if table do
      user_id = get_user_id(socket)
      
      # Verificar si ya está unido
      case Tables.get_player_by_user_and_table(user_id, table.id) do
        nil ->
          # Crear nuevo jugador
          color = Tables.generate_random_color()
          
          case Tables.create_player(%{
            player_name: player_name,
            table_id: table.id,
            user_id: user_id,
            color: color
          }) do
            {:ok, player} ->
              # Notificar a otros jugadores
              Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:#{table.id}", {:player_joined, player})
              
              # Actualizar current_player y lista de jugadores
              players = Tables.list_players(table.id)
              
              {:noreply, 
               socket 
               |> assign(:current_player, player)
               |> assign(:players, players)
               |> put_flash(:info, "Te has unido como #{player.player_name} (#{String.capitalize(player.role)})")}
            
            {:error, changeset} ->
              errors = Ecto.Changeset.traverse_errors(changeset, fn {msg, _opts} -> msg end)
              {:noreply, put_flash(socket, :error, "Error al unirse: #{inspect(errors)}")}
          end
        
        existing_player ->
          # Ya estaba unido, usar ese jugador
          {:noreply, assign(socket, :current_player, existing_player)}
      end
    else
      {:noreply, put_flash(socket, :error, "Mesa no disponible")}
    end
  end

  # Salir de la mesa
  @impl true
  def handle_event("leave_table", _params, socket) do
    current_player = socket.assigns.current_player
    
    if current_player do
      Tables.delete_player(current_player)
      Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:#{current_player.table_id}", {:player_left, current_player.id})
      
      {:noreply, 
       socket 
       |> assign(:current_player, nil)
       |> put_flash(:info, "Has salido de la mesa")}
    else
      {:noreply, socket}
    end
  end

  # Asignar rol de GM a otro jugador (solo el GM actual puede hacerlo)
  @impl true
  def handle_event("assign_gm", %{"player_id" => player_id}, socket) do
    current_player = socket.assigns.current_player
    table = socket.assigns.table
    
    cond do
      !current_player || current_player.role != "gm" ->
        {:noreply, put_flash(socket, :error, "Solo el GM puede asignar otro GM")}
      
      !table ->
        {:noreply, put_flash(socket, :error, "Mesa no encontrada")}
      
      true ->
        case Tables.get_player!(player_id) do
          nil ->
            {:noreply, put_flash(socket, :error, "Jugador no encontrado")}
          
          target_player ->
            if target_player.table_id != table.id do
              {:noreply, put_flash(socket, :error, "El jugador no pertenece a esta mesa")}
            else
              Tables.assign_gm_role(target_player)
              players = Tables.list_players(table.id)
              
              Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:#{table.id}", {:players_updated, players})
              
              {:noreply, 
               socket 
               |> assign(:players, players)
               |> put_flash(:info, "#{target_player.player_name} es ahora el GM")}
            end
        end
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="relative w-full h-screen overflow-hidden bg-gray-900">
      <%= if @error do %>
        {/* Mostrar error */}
        <div class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
          <div class="text-center space-y-4 p-8">
            <div class="text-6xl">😕</div>
            <h1 class="text-2xl font-bold text-red-500">Error</h1>
            <p class="text-gray-400"><%= @error %></p>
            <.link navigate="/" class="inline-block px-6 py-3 bg-accent-color text-white rounded-lg hover:opacity-90 transition">
              Volver al inicio
            </.link>
          </div>
        </div>
      <% else %>
        {/* Panel de jugadores - Visible solo si hay jugadores */}
        <%= if length(@players) > 0 do %>
          <div class="absolute top-4 right-4 z-40 bg-gray-800 bg-opacity-90 rounded-lg p-4 shadow-lg min-w-[200px]">
            <h3 class="text-white font-semibold mb-3 text-sm border-b border-gray-700 pb-2">
              Jugadores (<%= length(@players) %>)
            </h3>
            <ul class="space-y-2">
              <%= for player <- @players do %>
                <li class="flex items-center justify-between text-sm">
                  <div class="flex items-center gap-2">
                    <span 
                      class="w-3 h-3 rounded-full" 
                      style={"background-color: #{player.color}"}
                    >
                    </span>
                    <span class="text-gray-200"><%= player.player_name %></span>
                  </div>
                  <%= if player.role == "gm" do %>
                    <span class="text-xs bg-purple-600 text-white px-2 py-1 rounded">GM</span>
                  <% end %>
                </li>
              <% end %>
            </ul>
          </div>
        <% end %>

        {/* Modal para unirse a la mesa - Solo si no es jugador */}
        <%= if !@current_player do %>
          <div class="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
            <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
              <h2 class="text-2xl font-bold text-white mb-4">
                <%= if @table do %>Unirse a: <%= @table.name %><% else %>Mesa no disponible<% end %>
              </h2>
              
              <form phx-submit="join_table" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">
                    Tu nombre
                  </label>
                  <input 
                    type="text" 
                    name="player_name" 
                    required
                    minlength="2"
                    maxlength="50"
                    placeholder="Ej: Aragorn"
                    class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-color"
                  />
                </div>
                
                <div class="flex gap-3">
                  <button 
                    type="submit" 
                    class="flex-1 px-6 py-3 bg-accent-color text-white rounded-lg hover:opacity-90 transition font-semibold"
                  >
                    Unirse
                  </button>
                  <.link 
                    navigate="/" 
                    class="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:opacity-90 transition text-center"
                  >
                    Cancelar
                  </.link>
                </div>
              </form>
              
              <p class="mt-4 text-xs text-gray-400">
                El primer jugador en unirse será automáticamente el GM.
              </p>
            </div>
          </div>
        <% end %>

        {/* Contenedor principal donde React monta sus componentes */}
        <div 
          id="canvas-container" 
          class="absolute inset-0"
          phx-hook="ReactCanvasHook"
          data-table-id={@table && @table.id}
          data-table-slug={@table && @table.slug}
          data-player-id={@current_player && @current_player.id}
          data-player-role={@current_player && @current_player.role}
          data-player-name={@current_player && @current_player.player_name}
          data-is-gm={@current_player && @current_player.role == "gm"}
        >
          {/* El canvas de PixiJS y los componentes de React se inyectan aquí */}
        </div>

        {/* Loading indicator */}
        <div 
          id="loading-indicator" 
          class="absolute inset-0 flex items-center justify-center bg-gray-900 z-50"
          phx-update="ignore"
        >
          <div class="text-center space-y-4">
            <div class="w-16 h-16 border-4 border-accent-color border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-gray-400">Cargando mesa virtual...</p>
            <%= if @table do %>
              <p class="text-accent-color font-semibold"><%= @table.name %></p>
            <% end %>
          </div>
        </div>
      <% end %>
    </div>
    """
  end

  # ==================== FUNCIONES AUXILIARES ====================
  
  defp get_current_player(socket, table_id) do
    user_id = get_user_id(socket)
    
    if user_id do
      Tables.get_player_by_user_and_table(user_id, table_id)
    else
      nil
    end
  end
  
  defp get_user_id(socket) do
    # Por ahora usamos un ID temporal basado en el session o generamos uno aleatorio
    # En producción esto vendría del sistema de autenticación
    case get_session(socket, :user_id) do
      nil -> 
        # Generar un ID temporal para sesiones anónimas
        temp_id = "anon_#{:crypto.strong_rand_bytes(8) |> Base.encode16(case: :lower)}"
        put_session(socket, :user_id, temp_id)
        temp_id
      
      user_id -> user_id
    end
  end
end
