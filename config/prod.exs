import Config

# Producción: configuración para el endpoint
config :my_vtt, MyVttWeb.Endpoint,
  cache_static_manifest: "priv/static/cache_manifest.json",
  server: true

# Logger en producción
config :logger, level: :info

# No incluir rutas de debug en producción
config :my_vtt, :dev_routes, false
