ExUnit.start()

# Configurar Sandbox para tests concurrentes
Ecto.Adapters.SQL.Sandbox.mode(MyVtt.Repo, :manual)
