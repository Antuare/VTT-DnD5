defmodule MyVtt.DataCase do
  @moduledoc """
  Módulo base para tests de datos y cambiosets.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import Ecto
      import Ecto.Changeset
      import Ecto.Query
      import MyVtt.DataCase
      alias MyVtt.Repo
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
  Helper para manejar errores en cambiosets.
  """
  def on_invalid_changeset(changeset, error_field \\ nil) do
    assert changeset.valid? == false
    
    if error_field do
      assert errors_on(changeset)[error_field] != []
    end
    
    changeset
  end

  @doc """
  Obtiene los errores de un changeset como un mapa.
  """
  def errors_on(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", fn _ -> to_string(value) end)
      end)
    end)
  end
end
