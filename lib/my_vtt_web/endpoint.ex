defmodule MyVttWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :my_vtt

  @session_options [
    store: :cookie,
    key: "_my_vtt_key",
    signing_salt: "my_vtt_signing_salt",
    same_site: "Lax"
  ]

  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]
  socket "/channel", MyVttWeb.TableChannel

  plug Plug.Static,
    at: "/",
    from: :my_vtt,
    gzip: false,
    only: MyVttWeb.static_paths()

  if code_reloading? do
    socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket
    plug Phoenix.LiveReloader
    plug Phoenix.CodeReloader
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options
  plug MyVttWeb.Router
end
