defmodule MyVtt.Tables.ChatMessage do
  @moduledoc """
  Schema para un mensaje de chat en una mesa de juego.
  """
  
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "chat_messages" do
    field :user, :string
    field :message, :string
    field :is_system, :boolean, default: false
    
    # Relación con la mesa
    belongs_to :table, MyVtt.Tables.Table, type: :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(chat_message, attrs) do
    chat_message
    |> cast(attrs, [:user, :message, :is_system, :table_id])
    |> validate_required([:message, :table_id])
    |> validate_length(:user, min: 1, max: 50)
    |> validate_length(:message, min: 1, max: 1000)
    |> foreign_key_constraint(:table_id)
  end
  
  @doc """
  Crea un changeset para un mensaje de sistema.
  """
  def system_changeset(attrs) do
    %__MODULE__{}
    |> cast(Map.put(attrs, :is_system, true), [:user, :message, :is_system, :table_id])
    |> validate_required([:message, :table_id])
  end
end
