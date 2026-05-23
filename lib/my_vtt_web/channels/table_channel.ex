defmodule MyVttWeb.TableChannel do
  @moduledoc """
  Canal de Phoenix para sincronizar el estado de la mesa en tiempo real.
  Maneja movimientos de tokens, tiradas de dados y chat.
  """

  use Phoenix.Channel

  @impl true
  def join("table:main", _payload, socket) do
    # Obtener estado actual del juego
    tokens = MyVtt.GameState.get_tokens()
    
    {:ok, %{tokens: tokens}, socket}
  end

  @impl true
  def join("table:" <> _private_table_id, _payload, socket) do
    {:error, %{reason: "unauthorized"}}
  end

  # Movimiento de tokens

  @impl true
  def handle_in("move_token", %{"token_id" => token_id, "x" => x, "y" => y}, socket) do
    # Actualizar posición en GameState
    MyVtt.GameState.update_token_position(token_id, x, y)
    
    # Broadcast a todos los clientes
    broadcast!(socket, "token_moved", %{
      token_id: token_id,
      x: x,
      y: y
    })

    {:reply, :ok, socket}
  end

  # Tirada de dados

  @impl true
  def handle_in("roll_dice", %{"expression" => expression}, socket) do
    # Procesar tirada de dados (se podría usar una librería como rpg_dice_roller en Elixir)
    result = roll_dice(expression)
    
    # Guardar resultado
    MyVtt.GameState.set_last_dice_result(result)
    
    # Broadcast a todos los clientes
    broadcast!(socket, "dice_rolled", %{
      expression: expression,
      result: result
    })

    {:reply, :ok, socket}
  end

  # Mensaje de chat

  @impl true
  def handle_in("chat_message", %{"message" => message}, socket) do
    # Obtener usuario del socket (si está autenticado)
    user = get_user_from_socket(socket)
    
    # Guardar mensaje
    MyVtt.GameState.add_chat_message(%{
      "user" => user,
      "message" => message
    })

    {:reply, :ok, socket}
  end

  # Recibir eventos de PubSub y reenviar al cliente

  @impl true
  def handle_info({:token_update, payload}, socket) do
    push(socket, "token_update", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_info({:chat_message, message}, socket) do
    push(socket, "chat_message", message)
    {:noreply, socket}
  end

  @impl true
  def handle_info({:dice_result, result}, socket) do
    push(socket, "dice_result", result)
    {:noreply, socket}
  end

  # Funciones privadas

  defp roll_dice(expression) do
    # Implementación simple de tirada de dados
    # En producción, usar una librería como :rpg_dice_roller
    regex = ~r/(\d+)d(\d+)/
    
    case Regex.run(regex, expression) do
      [_, count_str, sides_str] ->
        count = String.to_integer(count_str)
        sides = String.to_integer(sides_str)
        
        rolls = Enum.map(1..count, fn _ -> :rand.uniform(sides) end)
        total = Enum.sum(rolls)
        
        "#{Enum.join(rolls, ", ")} = #{total}"
      
      nil ->
        "Tirada inválida"
    end
  end

  defp get_user_from_socket(socket) do
    # Si hay autenticación, obtener usuario aquí
    # Por ahora, usar un nombre genérico
    socket.assigns[:user] || "Jugador"
  end
end
