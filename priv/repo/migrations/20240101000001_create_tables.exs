defmodule MyVtt.Repo.Migrations.CreateTables do
  use Ecto.Migration

  def change do
    create table(:tables, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :slug, :string, null: false
      add :description, :text
      add :active, :boolean, default: true, null: false
      add :max_players, :integer, default: 10, null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:tables, [:slug])
    create unique_index(:tables, [:name])
  end
end
