defmodule MyVttWeb.ConnCase do
  @moduledoc """
  Módulo base para tests que requieren Plug.Conn.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Plug.Conn
      import Phoenix.ConnTest
      import Phoenix.LiveViewTest
      import MyVttWeb.ConnCase
      alias MyVttWeb.Router.Helpers, as: Routes

      # Endpoint bajo test
      @endpoint MyVttWeb.Endpoint
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(MyVtt.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(MyVtt.Repo, {:shared, self()})
    end

    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end

  @doc """
  Crea un usuario y lo autentica en la conexión.
  """
  def login_user(conn, user \\ nil) do
    user = user || create_test_user()
    {:ok, token, _session} = MyVtt.Accounts.create_session(user)

    conn
    |> Phoenix.ConnTest.init_test_session(%{
      session_token: token,
      user_id: user.id
    })
  end

  defp create_test_user(attrs \\ %{}) do
    default_attrs = %{
      email: "user#{System.unique_integer([:positive, :monotonic])}@test.com",
      username: "user#{System.unique_integer([:positive, :monotonic])}",
      password: "password123",
      password_confirmation: "password123"
    }

    attrs = Map.merge(default_attrs, attrs)
    {:ok, user} = MyVtt.Accounts.register_user(attrs)
    user
  end
end
