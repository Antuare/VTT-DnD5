defmodule MyVtt.Repo.Migrations.CreateSessions do
  use Ecto.Migration

  def change do
    create table(:sessions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :token, :string, null: false
      add :user_agent, :string
      add :remote_ip, :string
      add :expires_at, :utc_datetime, null: false
      add :last_activity_at, :utc_datetime, null: false
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create unique_index(:sessions, [:token])
    create index(:sessions, [:user_id])
    create index(:sessions, [:expires_at])
  end
end
