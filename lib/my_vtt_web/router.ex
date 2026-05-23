defmodule MyVttWeb.Router do
  use MyVttWeb, :router
  
  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {MyVttWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end
  
  pipeline :api do
    plug :accepts, ["json"]
  end
  
  scope "/", MyVttWeb do
    pipe_through :browser

    live "/", TableLive
    # Ruta actualizada para usar slug en lugar de ID numérico
    live "/table/:slug", TableLive
  end
  
  # Other scopes may use custom pipelines.
  # scope "/api", MyVttWeb do
  #   pipe_through :api
  # end
  
  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:my_vtt, :dev_routes) do
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: MyVttWeb.Telemetry
    end
  end
end
