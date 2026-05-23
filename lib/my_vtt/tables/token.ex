defmodule MyVtt.Tables.Token do
  @moduledoc """
  Schema para un token en una mesa de juego.
  Representa un personaje, monstruo u objeto en el mapa.
  """
  
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "tokens" do
    field :name, :string
    field :x, :integer, default: 0
    field :y, :integer, default: 0
    field :size, :integer, default: 50
    field :color, :string
    field :image_url, :string
    field :is_visible, :boolean, default: true
    field :is_system, :boolean, default: false
    field :extra_data, :map, default: %{}
    
    # Relación con la mesa
    belongs_to :table, MyVtt.Tables.Table, type: :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(token, attrs) do
    token
    |> cast(attrs, [:name, :x, :y, :size, :color, :image_url, :is_visible, :is_system, :extra_data, :table_id])
    |> validate_required([:name, :table_id])
    |> validate_number(:x, greater_than_or_equal_to: 0)
    |> validate_number(:y, greater_than_or_equal_to: 0)
    |> validate_number(:size, greater_than: 0, less_than_or_equal_to: 200)
    |> foreign_key_constraint(:table_id)
  end
end
