defmodule MyVtt.Repo.Migrations.CreateChatMessages do
  use Ecto.Migration

  def change do
    create table(:chat_messages, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user, :string, null: false
      add :message, :text, null: false
      add :is_system, :boolean, default: false, null: false
      add :table_id, references(:tables, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:chat_messages, [:table_id])
    create index(:chat_messages, [:inserted_at])
  end
end
