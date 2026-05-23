defmodule MyVttWeb.TableLive do
  @moduledoc """
  LiveView que sirve de puente para cargar el HTML base donde React se acopla.
  Ahora carga datos desde la base de datos y soporta múltiples mesas por slug.
  """
  
  use MyVttWeb, :live_view
  alias MyVtt.Tables

  @impl true
  def mount(%{"slug" => slug}, _session, socket) do
    # Buscar la mesa por slug
    case Tables.get_table_by_slug(slug) do
      nil ->
        # Mesa no encontrada, redirigir o mostrar error
        {:ok, 
         socket 
         |> assign(:error, "Mesa no encontrada")
         |> assign(:table, nil), temporary_assigns: [table: nil]}
      
      table ->
        # Suscribirse a actualizaciones de esta mesa
        Phoenix.PubSub.subscribe(MyVtt.PubSub, "table:#{table.id}")
        
        # Cargar datos iniciales
        tokens = Tables.list_tokens(table.id)
        chat_messages = Tables.list_chat_messages(table.id, 50)
        
        {:ok, 
         socket 
         |> assign(:table, table)
         |> assign(:tokens, tokens)
         |> assign(:chat_messages, chat_messages)
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
        {/* Contenedor principal donde React monta sus componentes */}
        <div 
          id="canvas-container" 
          class="absolute inset-0"
          phx-hook="ReactCanvasHook"
          data-table-id={@table && @table.id}
          data-table-slug={@table && @table.slug}
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
end
