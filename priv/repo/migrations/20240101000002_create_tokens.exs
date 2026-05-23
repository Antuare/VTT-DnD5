defmodule MyVtt.Repo.Migrations.CreateTokens do
  use Ecto.Migration

  def change do
    create table(:tokens, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :x, :integer, default: 0, null: false
      add :y, :integer, default: 0, null: false
      add :size, :integer, default: 50, null: false
      add :color, :string
      add :image_url, :string
      add :is_visible, :boolean, default: true, null: false
      add :extra_data, :map, default: %{}
      add :table_id, references(:tables, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:tokens, [:table_id])
    create index(:tokens, [:x, :y])
  end
end
