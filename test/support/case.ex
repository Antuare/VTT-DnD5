defmodule MyVtt.TestCase do
  @moduledoc """
  Módulo base para tests de MyVtt.
  Proporciona funciones helper y configuración común para todos los tests.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import MyVtt.TestCase
      alias MyVtt.Repo

      # Helpers comunes
      defp unique_email(), do: "user#{System.unique_integer([:positive, :monotonic])}@test.com"
      defp unique_username(), do: "user#{System.unique_integer([:positive, :monotonic])}"
    end
  end

  setup tags do
    :ok = Ecto.Adapters.SQL.Sandbox.checkout(MyVtt.Repo)

    unless tags[:async] do
      Ecto.Adapters.SQL.Sandbox.mode(MyVtt.Repo, {:shared, self()})
    end

    :ok
  end

  @doc """
  Crea un usuario de test válido.
  """
  def create_test_user(attrs \\ %{}) do
    default_attrs = %{
      email: unique_email(),
      username: unique_username(),
      password: "password123",
      password_confirmation: "password123"
    }

    attrs = Map.merge(default_attrs, attrs)

    {:ok, user} = MyVtt.Accounts.register_user(attrs)
    user
  end

  @doc """
  Crea una sesión para un usuario.
  """
  def create_test_session(user, opts \\ []) do
    {:ok, token, session} = MyVtt.Accounts.create_session(user, opts)
    {token, session}
  end

  # Funciones helper únicas por proceso
  defp unique_email(), do: "user#{System.unique_integer([:positive, :monotonic])}@test.com"
  defp unique_username(), do: "user#{System.unique_integer([:positive, :monotonic])}"
end
