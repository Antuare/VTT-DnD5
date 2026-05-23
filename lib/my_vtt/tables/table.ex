defmodule MyVtt.Tables.Table do
  @moduledoc """
  Schema para una mesa de juego virtual.
  Cada mesa tiene su propio conjunto de tokens y mensajes de chat.
  """
  
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "tables" do
    field :name, :string
    field :slug, :string
    field :description, :string
    field :active, :boolean, default: true
    field :max_players, :integer, default: 10
    
    # Relación con tokens y mensajes
    has_many :tokens, MyVtt.Tables.Token, on_delete: :delete_all
    has_many :chat_messages, MyVtt.Tables.ChatMessage, on_delete: :delete_all

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(table, attrs) do
    table
    |> cast(attrs, [:name, :slug, :description, :active, :max_players])
    |> validate_required([:name, :slug])
    |> validate_length(:name, min: 1, max: 100)
    |> validate_length(:description, max: 500)
    |> validate_number(:max_players, greater_than: 0, less_than_or_equal_to: 50)
    |> unique_constraint(:slug)
    |> unique_constraint(:name)
  end
  
  @doc """
  Obtiene una mesa por slug (case-insensitive).
  """
  def get_by_slug(slug) when is_binary(slug) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(t in __MODULE__,
      where: fragment("LOWER(?)", t.slug) == ^String.downcase(slug),
      select: t
    )
    |> Repo.one()
  end
end
