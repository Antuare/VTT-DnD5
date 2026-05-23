defmodule MyVtt.Application do
  @moduledoc """
  The main Application for the MyVtt application.
  """

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      MyVttWeb.Telemetry,
      {Phoenix.PubSub, name: MyVtt.PubSub},
      MyVtt.Repo,
      MyVtt.GameState,
      MyVttWeb.Endpoint
    ]

    opts = [strategy: :one_for_one, name: MyVtt.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    MyVttWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
