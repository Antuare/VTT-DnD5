defmodule MyVtt.Repo.Migrations.CreatePlayers do
  use Ecto.Migration

  def change do
    create table(:players, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :player_name, :string, null: false
      add :role, :string, null: false, default: "player"
      add :color, :string, null: false, default: "#808080"
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: true
      add :table_id, references(:tables, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:players, [:table_id])
    create index(:players, [:user_id])
    create unique_index(:players, [:table_id, :user_id], name: :players_table_user_unique_index)
  end
end
