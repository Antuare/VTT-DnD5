defmodule MyVtt.GameState do
  @moduledoc """
  Estado del juego en memoria usando ETS.
  Almacena tokens, configuraciones de mesa y estado temporal.
  """

  use GenServer

  @table_name :my_vtt_game_state

  # API Pública

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(_opts) do
    # Crear tabla ETS
    :ets.new(@table_name, [:set, :named_table, :public])
    {:ok, %{}}
  end

  # Tokens

  def get_tokens(table_id \\ "main") do
    case :ets.lookup(@table_name, {:tokens, table_id}) do
      [{_, tokens}] -> tokens
      [] -> []
    end
  end

  def add_token(token, table_id \\ "main") do
    tokens = get_tokens(table_id)
    updated_tokens = [token | tokens]
    :ets.insert(@table_name, {{:tokens, table_id}, updated_tokens})
    broadcast_token_update(:added, token)
    :ok
  end

  def update_token_position(token_id, x, y, table_id \\ "main") do
    tokens = get_tokens(table_id)
    
    updated_tokens = 
      Enum.map(tokens, fn t ->
        if t["id"] == token_id do
          Map.merge(t, %{"x" => x, "y" => y})
        else
          t
        end
      end)

    :ets.insert(@table_name, {{:tokens, table_id}, updated_tokens})
    
    updated_token = Enum.find(updated_tokens, fn t -> t["id"] == token_id end)
    broadcast_token_update(:moved, updated_token)
    :ok
  end

  def remove_token(token_id, table_id \\ "main") do
    tokens = get_tokens(table_id)
    updated_tokens = Enum.reject(tokens, fn t -> t["id"] == token_id end)
    :ets.insert(@table_name, {{:tokens, table_id}, updated_tokens})
    broadcast_token_update(:removed, %{"id" => token_id})
    :ok
  end

  def get_token(token_id, table_id \\ "main") do
    tokens = get_tokens(table_id)
    Enum.find(tokens, fn t -> t["id"] == token_id end)
  end

  # Mensajes de chat (últimos 50)

  def get_chat_messages(table_id \\ "main") do
    case :ets.lookup(@table_name, {:chat, table_id}) do
      [{_, messages}] -> messages
      [] -> []
    end
  end

  def add_chat_message(message, table_id \\ "main") do
    messages = get_chat_messages(table_id)
    
    new_message = %{
      "id" => generate_id(),
      "user" => message["user"] || "Anónimo",
      "message" => message["message"],
      "timestamp" => DateTime.utc_now() |> DateTime.to_iso8601()
    }

    updated_messages = 
      [new_message | messages]
      |> Enum.take(50)

    :ets.insert(@table_name, {{:chat, table_id}, updated_messages})
    broadcast_chat_message(new_message)
    :ok
  end

  # Resultados de dados (último)

  def set_last_dice_result(result, table_id \\ "main") do
    :ets.insert(@table_name, {{:dice, table_id}, result})
    broadcast_dice_result(result)
    :ok
  end

  def get_last_dice_result(table_id \\ "main") do
    case :ets.lookup(@table_name, {:dice, table_id}) do
      [{_, result}] -> result
      [] -> nil
    end
  end

  # Funciones privadas

  defp broadcast_token_update(action, token) do
    payload = %{action: action, token: token}
    Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:main", {:token_update, payload})
  end

  defp broadcast_chat_message(message) do
    Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:main", {:chat_message, message})
  end

  defp broadcast_dice_result(result) do
    Phoenix.PubSub.broadcast(MyVtt.PubSub, "table:main", {:dice_result, result})
  end

  defp generate_id do
    :crypto.strong_rand_bytes(12) |> Base.encode16(case: :lower)
  end
end
