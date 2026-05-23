import Config

# Desarrollo: habilitar recarga de código y rutas de debug
config :my_vtt, MyVttWeb.Endpoint,
  debug_errors: true,
  code_reloader: true,
  check_origin: false,
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--sourcemap=inline --watch)]},
    tailwind: {Tailwind, :install_and_run, [:default, ~w(--watch)]}
  ]

# Habilitar LiveDashboard en desarrollo
config :my_vtt, :dev_routes, true

# Logger en desarrollo
config :logger, :console, format: "$time $metadata[$level] $message\n"

# SQLite3 no requiere configuración especial para desarrollo
