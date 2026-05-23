defmodule MyVttWeb.TableLive do
  @moduledoc """
  LiveView que sirve de puente para cargar el HTML base donde React se acopla.
  """

  use MyVttWeb, :live_view

  @impl true
  def mount(_params, _session, socket) do
    # Suscribirse a actualizaciones del canal
    Phoenix.PubSub.subscribe(MyVtt.PubSub, "table:main")

    {:ok, socket}
  end

  @impl true
  def handle_params(_params, _uri, socket) do
    {:noreply, socket}
  end

  @impl true
  def handle_info({:token_update, payload}, socket) do
    # Los updates de tokens se manejan directamente por el canal de JS
    {:noreply, socket}
  end

  @impl true
  def handle_info({:chat_message, message}, socket) do
    # Los mensajes de chat se manejan directamente por el canal de JS
    {:noreply, socket}
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Contenedor principal donde React monta sus componentes */}
      <div 
        id="canvas-container" 
        class="absolute inset-0"
        phx-hook="ReactCanvasHook"
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
        </div>
      </div>
    </div>
    """
  end
end
