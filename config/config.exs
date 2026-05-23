# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file loads in four stages:
#
#     1. config/config.exs          # The base configuration for all environments
#     2. config/dev.exs             # Development only (not committed to source control)
#     3. config/test.exs            # Test only (not committed to source control)
#     4. config/prod.exs            # Production only (not committed to source control)
#
# Configuration changes are not picked up on a running server;
# if you change this file, you need to restart the application.

import Config

# Configura el endpoint
config :my_vtt, MyVttWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Phoenix.Endpoint.Cowboy2Adapter,
  render_errors: [view: MyVttWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: MyVtt.PubSub,
  live_view: [signing_salt: "my_vtt_live_view_salt"]

# Configura el repo de Ecto con SQLite3
config :my_vtt, MyVtt.Repo,
  database: System.get_env("DATABASE_URL") || "priv/my_vtt.db",
  pool_size: 5,
  stacktrace: true,
  show_sensitive_data_on_connection_error: true

# Configura esbuild para compilar assets
config :esbuild,
  version: "0.19.2",
  default: [
    args: ~w(js/app.ts --bundle --target=es2020 --outdir=../priv/static/assets),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configura Tailwind CSS
config :tailwind,
  version: "3.3.2",
  default: [
    args: ~w(
      --config=tailwind.config.js
      --input=css/app.css
      --output=../priv/static/assets/app.css
    ),
    cd: Path.expand("../assets", __DIR__)
  ]

# Configuración de Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Configuración de gettext
config :my_vtt, MyVtt.Gettext,
  default_locale: "en",
  locales: ~w(en es)

# Importa configuración específica por entorno
import_config "#{config_env()}.exs"
