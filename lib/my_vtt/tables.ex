defmodule MyVtt.Tables do
  @moduledoc """
  Contexto para gestión de mesas, tokens y mensajes de chat.
  Proporciona funciones CRUD para persistencia en base de datos.
  """
  
  import Ecto.Query, warn: false
  alias MyVtt.Repo
  alias MyVtt.Tables.{Table, Token, ChatMessage}

  # ==================== TABLES ====================
  
  @doc """
  Lista todas las mesas.
  """
  def list_tables do
    Repo.all(Table)
  end

  @doc """
  Obtiene una mesa por ID.
  """
  def get_table!(id), do: Repo.get!(Table, id)

  @doc """
  Obtiene una mesa por su slug (identificador público).
  Case-insensitive.
  """
  def get_table_by_slug(slug) when is_binary(slug) do
    Table.get_by_slug(slug)
  end

  @doc """
  Crea una nueva mesa.
  Genera automáticamente un slug único si no se proporciona.
  """
  def create_table(attrs \\ %{}) do
    attrs = 
      if attrs[:slug] || attrs["slug"] do
        attrs
      else
        Map.put(attrs, :slug, generate_table_slug())
      end
    
    %Table{}
    |> Table.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Actualiza una mesa existente.
  """
  def update_table(%Table{} = table, attrs) do
    table
    |> Table.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Elimina una mesa y todos sus tokens y mensajes asociados.
  """
  def delete_table(%Table{} = table) do
    Repo.delete(table)
  end

  @doc """
  Cambia el estado activo de una mesa.
  """
  def toggle_table_active(%Table{} = table) do
    table
    |> Table.changeset(%{active: !table.active})
    |> Repo.update()
  end

  # ==================== TOKENS ====================
  
  @doc """
  Lista todos los tokens de una mesa.
  """
  def list_tokens(table_id) do
    Token
    |> where(table_id: ^table_id)
    |> order_by(asc: :inserted_at)
    |> Repo.all()
  end

  @doc """
  Obtiene un token por ID.
  """
  def get_token!(id), do: Repo.get!(Token, id)

  @doc """
  Obtiene un token por ID y verifica que pertenezca a la mesa especificada.
  """
  def get_token_by_table(token_id, table_id) do
    Repo.get_by(Token, id: token_id, table_id: table_id)
  end

  @doc """
  Crea un nuevo token en una mesa.
  """
  def create_token(attrs \\ %{}) do
    %Token{}
    |> Token.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Actualiza un token existente.
  """
  def update_token(%Token{} = token, attrs) do
    token
    |> Token.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Actualiza la posición de un token.
  """
  def update_token_position(token_id, x, y) do
    case Repo.get(Token, token_id) do
      nil -> {:error, :not_found}
      token ->
        token
        |> Token.changeset(%{x: x, y: y})
        |> Repo.update()
    end
  end

  @doc """
  Elimina un token.
  """
  def delete_token(%Token{} = token) do
    Repo.delete(token)
  end

  @doc """
  Elimina un token por ID.
  """
  def delete_token_by_id(token_id) do
    case Repo.get(Token, token_id) do
      nil -> {:error, :not_found}
      token -> Repo.delete(token)
    end
  end

  # ==================== CHAT MESSAGES ====================
  
  @doc """
  Lista los últimos mensajes de chat de una mesa (ordenados por fecha).
  Limita a 50 mensajes por defecto.
  """
  def list_chat_messages(table_id, limit \\ 50) do
    ChatMessage
    |> where(table_id: ^table_id)
    |> order_by(desc: :inserted_at)
    |> limit(^limit)
    |> Repo.all()
    |> Enum.reverse()
  end

  @doc """
  Obtiene un mensaje de chat por ID.
  """
  def get_chat_message!(id), do: Repo.get!(ChatMessage, id)

  @doc """
  Crea un nuevo mensaje de chat.
  """
  def create_chat_message(attrs \\ %{}) do
    %ChatMessage{}
    |> ChatMessage.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Limpia mensajes antiguos de chat (más allá del límite).
  """
  def prune_old_messages(table_id, keep_count \\ 50) do
    # Obtener IDs de los mensajes a mantener (los más recientes)
    keep_ids =
      ChatMessage
      |> where(table_id: ^table_id)
      |> order_by(desc: :inserted_at)
      |> limit(^keep_count)
      |> select([:id])
      |> Repo.all()
      |> Enum.map(& &1.id)

    # Eliminar el resto
    ChatMessage
    |> where(table_id: ^table_id)
    |> where(not fragment("id IN ?", ^keep_ids))
    |> Repo.delete_all()
  end

  # ==================== UTILIDADES ====================
  
  @doc """
  Genera un slug único para una mesa.
  """
  def generate_table_slug do
    :crypto.strong_rand_bytes(6)
    |> Base.encode16(case: :lower)
  end
  
  @doc """
  Carga datos iniciales para una mesa (tokens de ejemplo, etc).
  """
  def seed_table_data(table_id) do
    # Tokens de ejemplo
    example_tokens = [
      %{name: "Guerrero", x: 100, y: 100, size: 50, color: "#FF5733"},
      %{name: "Mago", x: 200, y: 100, size: 50, color: "#33FF57"},
      %{name: "Pícaro", x: 150, y: 200, size: 50, color: "#3357FF"},
      %{name: "Clérigo", x: 250, y: 200, size: 50, color: "#F333FF"}
    ]
    
    Enum.each(example_tokens, fn attrs ->
      create_token(Map.put(attrs, :table_id, table_id))
    end)
    
    # Mensaje de bienvenida
    create_chat_message(%{
      table_id: table_id,
      user: "Sistema",
      message: "¡Bienvenido a la mesa! Usa las herramientas para interactuar.",
      is_system: true
    })
  end
end
