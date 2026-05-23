defmodule MyVtt.Tables.Player do
  @moduledoc """
  Schema para un jugador en una mesa de juego.
  Cada jugador tiene un rol (GM o player) y pertenece a una mesa específica.
  """
  
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "players" do
    field :player_name, :string
    field :role, :string, default: "player"
    field :color, :string, default: "#808080"
    
    # Relaciones
    belongs_to :user, MyVtt.Accounts.User, type: :binary_id
    belongs_to :table, MyVtt.Tables.Table, type: :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(player, attrs) do
    player
    |> cast(attrs, [:player_name, :role, :color, :user_id, :table_id])
    |> validate_required([:player_name, :role, :table_id])
    |> validate_inclusion(:role, ["gm", "player"])
    |> validate_length(:player_name, min: 1, max: 50)
    |> validate_color(:color)
    |> foreign_key_constraint(:table_id)
    |> foreign_key_constraint(:user_id)
    |> unique_constraint(:user_id, name: :players_table_user_unique_index, 
                         message: "already joined this table")
  end

  @doc """
  Valida que el color sea un hexadecimal válido.
  """
  def validate_color(changeset, field) do
    validate_change(changeset, field, fn :color, color ->
      case String.match?(color, ~r/^#[0-9A-Fa-f]{6}$/) do
        true -> []
        false -> [{field, "must be a valid hex color (e.g., #FF5733)"}]
      end
    end)
  end

  @doc """
  Verifica si el jugador es el GM de la mesa.
  """
  def is_gm?(%Player{role: "gm"}), do: true
  def is_gm?(%Player{role: "player"}), do: false

  @doc """
  Obtiene todos los jugadores de una mesa.
  """
  def by_table(table_id) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(p in __MODULE__,
      where: p.table_id == ^table_id,
      order_by: [desc: p.inserted_at]
    )
    |> Repo.all()
  end

  @doc """
  Obtiene el GM de una mesa.
  """
  def get_gm(table_id) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(p in __MODULE__,
      where: p.table_id == ^table_id and p.role == "gm",
      select: p
    )
    |> Repo.one()
  end

  @doc """
  Obtiene un jugador por ID de usuario y mesa.
  """
  def by_user_and_table(user_id, table_id) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(p in __MODULE__,
      where: p.user_id == ^user_id and p.table_id == ^table_id,
      select: p
    )
    |> Repo.one()
  end
end
