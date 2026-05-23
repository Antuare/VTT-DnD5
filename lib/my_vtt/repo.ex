defmodule MyVtt.Repo do
  use Ecto.Repo,
    otp_app: :my_vtt,
    adapter: Ecto.Adapters.SQLite3

  @doc """
  Dynamically loads the repository url from the
  DATABASE_URL environment variable.
  """
  def init(_type, _opts) do
    {:ok, Keyword.put([], :database, System.get_env("DATABASE_URL"))}
  end
end
