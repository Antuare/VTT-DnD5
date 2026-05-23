import Config

# Test: configuración para pruebas
config :my_vtt, MyVtt.Repo,
  database: "priv/test.db",
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: 1

# No iniciar aplicaciones en test que puedan interferir
config :my_vtt, MyVttWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  server: false

# Logger silencioso en tests
config :logger, level: :warning
