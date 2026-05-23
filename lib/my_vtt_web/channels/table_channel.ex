defmodule MyVttWeb.TableChannel do
  @moduledoc """
  Canal de Phoenix para sincronizar el estado de la mesa en tiempo real.
  Maneja movimientos de tokens, tiradas de dados y chat con persistencia en DB.
  """
  
  use Phoenix.Channel
  alias MyVtt.Tables
  alias MyVtt.Tables.{Table, Token, ChatMessage}

  @impl true
  def join("table:" <> table_slug, _payload, socket) do
    # Buscar la mesa por slug
    case Tables.get_table_by_slug(table_slug) do
      nil ->
        {:error, %{reason: "Mesa no encontrada"}}
      
      table ->
        # Suscribirse a actualizaciones de esta mesa específica
        Phoenix.PubSub.subscribe(MyVtt.PubSub, "table:#{table.id}")
        
        # Cargar estado inicial desde DB
        tokens = Tables.list_tokens(table.id)
        chat_messages = Tables.list_chat_messages(table.id, 50)
        
        # Formatear tokens para el frontend
        tokens_payload = 
          Enum.map(tokens, fn token ->
            %{
              id: token.id,
              name: token.name,
              x: token.x,
              y: token.y,
              size: token.size,
              color: token.color,
              image_url: token.image_url,
              is_system: token.is_system
            }
          end)
        
        # Formatear mensajes para el frontend
        messages_payload =
          Enum.map(chat_messages, fn msg ->
            %{
              id: msg.id,
              user: msg.user,
              message: msg.message,
              is_system: msg.is_system,
              inserted_at: NaiveDateTime.to_iso8601(msg.inserted_at)
            }
          end)
        
        {:ok, %{
          table_id: table.id,
          table_slug: table.slug,
          tokens: tokens_payload,
          chat_messages: messages_payload
        }, assign(socket, :table_id, table.id)}
    end
  end

  @impl true
  def handle_in("move_token", %{token_id: token_id, x: x, y: y}, socket) do
    table_id = socket.assigns.table_id
    
    # Verificar que el token pertenece a esta mesa
    case Tables.get_token_by_table(token_id, table_id) do
      nil ->
        {:reply, {:error, %{reason: "Token no encontrado"}}, socket}
      
      token ->
        # Actualizar posición en DB
        case Tables.update_token_position(token_id, x, y) do
          {:ok, updated_token} ->
            # Broadcast a todos los clientes conectados a esta mesa
            broadcast!(socket, "token_moved", %{
              token_id: token_id,
              x: x,
              y: y,
              table_id: table_id
            })

            {:reply, :ok, socket}
          
          {:error, _reason} ->
            {:reply, {:error, %{reason: "No se pudo actualizar la posición"}}, socket}
        end
    end
  end

  # Tirada de dados
  @impl true
  def handle_in("roll_dice", %{expression: expression}, socket) do
    table_id = socket.assigns.table_id
    user = socket.assigns[:user] || "Jugador"
    
    # Procesar tirada de dados
    result = roll_dice(expression)
    
    # Crear mensaje de sistema en chat para registrar la tirada
    Tables.create_chat_message(%{
      table_id: table_id,
      user: user,
      message: "Tiró #{expression}: #{result}",
      is_system: true
    })
    
    # Broadcast a todos los clientes
    broadcast!(socket, "dice_rolled", %{
      expression: expression,
      result: result,
      user: user,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    })

    {:reply, :ok, socket}
  end

  # Mensaje de chat
  @impl true
  def handle_in("chat_message", %{message: message}, socket) do
    table_id = socket.assigns.table_id
    user = socket.assigns[:user] || "Jugador"
    
    # Guardar mensaje en DB
    case Tables.create_chat_message(%{
      table_id: table_id,
      user: user,
      message: message,
      is_system: false
    }) do
      {:ok, chat_message} ->
        # Broadcast a todos los clientes
        broadcast!(socket, "chat_message", %{
          id: chat_message.id,
          user: user,
          message: message,
          is_system: false,
          timestamp: NaiveDateTime.to_iso8601(chat_message.inserted_at)
        })
        
        # Limpiar mensajes antiguos si exceden el límite
        Tables.prune_old_messages(table_id, 100)

        {:reply, :ok, socket}
      
      {:error, changeset} ->
        {:reply, {:error, %{reason: "No se pudo enviar el mensaje", details: format_changeset_errors(changeset)}}, socket}
    end
  end

  # Recibir eventos de PubSub y reenviar al cliente (para actualizaciones desde otras fuentes)
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
    # Implementación mejorada de tirada de dados
    regex = ~r/(\d+)d(\d+)([+-]\d+)?/i
    
    case Regex.run(regex, expression) do
      [_, count_str, sides_str, modifier_str | _] ->
        count = String.to_integer(count_str)
        sides = String.to_integer(sides_str)
        modifier = if modifier_str, do: String.to_integer(modifier_str), else: 0
        
        # Validar límites razonables
        cond do
          count > 100 -> "Error: máximo 100 dados"
          sides > 1000 -> "Error: máximo 1000 caras"
          true ->
            rolls = Enum.map(1..count, fn _ -> :rand.uniform(sides) end)
            total = Enum.sum(rolls) + modifier
            
            rolls_str = Enum.join(rolls, ", ")
            if modifier != 0 do
              "#{rolls_str} #{if modifier > 0, do: "+", else: ""}#{modifier} = #{total}"
            else
              "#{rolls_str} = #{total}"
            end
        end
      
      nil ->
        "Tirada inválida. Formato esperado: XdY o XdY+Z"
    end
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
