defmodule MyVtt.HealthMonitor do
  @moduledoc """
  GenServer que monitorea la salud del sistema y registra errores críticos.
  Se ejecuta en segundo plano para detectar problemas de autenticación, 
  sesiones expiradas, fallos de base de datos y otros errores de máxima peligrosidad.
  """

  use GenServer
  require Logger

  # ==================== CLIENT API ====================

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  @doc """
  Registra un error crítico en el monitor.
  """
  def report_error(category, message, details \\ %{}) do
    GenServer.cast(__MODULE__, {:report_error, category, message, details})
  end

  @doc """
  Obtiene todos los errores registrados.
  """
  def get_errors do
    GenServer.call(__MODULE__, :get_errors)
  end

  @doc """
  Obtiene errores por categoría.
  """
  def get_errors_by_category(category) do
    GenServer.call(__MODULE__, {:get_errors_by_category, category})
  end

  @doc """
  Limpia todos los errores registrados.
  """
  def clear_errors do
    GenServer.cast(__MODULE__, :clear_errors)
  end

  @doc """
  Ejecuta un check completo de salud del sistema.
  """
  def run_health_check do
    GenServer.call(__MODULE__, :run_health_check)
  end

  @doc """
  Obtiene el estado de salud actual.
  """
  def get_health_status do
    GenServer.call(__MODULE__, :get_health_status)
  end

  # ==================== SERVER CALLBACKS ====================

  def init(_opts) do
    state = %{
      errors: [],
      health_checks: [],
      started_at: DateTime.utc_now(),
      check_count: 0
    }

    # Programar primer health check
    schedule_health_check()

    {:ok, state}
  end

  def handle_cast({:report_error, category, message, details}, state) do
    error = %{
      id: generate_error_id(),
      category: category,
      message: message,
      details: details,
      timestamp: DateTime.utc_now(),
      severity: calculate_severity(category, details)
    }

    Logger.error("HealthMonitor: #{category} - #{message} - #{inspect(details)}")

    new_state = %{
      state
      | errors: [error | state.errors],
        check_count: state.check_count + 1
    }

    {:noreply, new_state}
  end

  def handle_cast(:clear_errors, state) do
    {:noreply, %{state | errors: []}}
  end

  def handle_call(:get_errors, _from, state) do
    {:reply, Enum.reverse(state.errors), state}
  end

  def handle_call({:get_errors_by_category, category}, _from, state) do
    errors = 
      state.errors
      |> Enum.filter(fn e -> e.category == category end)
      |> Enum.reverse()

    {:reply, errors, state}
  end

  def handle_call(:run_health_check, _from, state) do
    results = perform_health_checks()

    new_state = %{
      state
      | health_checks: [results | state.health_checks],
        check_count: state.check_count + 1
    }

    {:reply, results, new_state}
  end

  def handle_call(:get_health_status, _from, state) do
    status = %{
      healthy: length(state.errors) == 0,
      total_errors: length(state.errors),
      critical_errors: count_critical_errors(state.errors),
      last_check: List.first(state.health_checks),
      uptime: DateTime.diff(DateTime.utc_now(), state.started_at, :second)
    }

    {:reply, status, state}
  end

  def handle_info(:health_check, state) do
    results = perform_health_checks()

    new_state = %{
      state
      | health_checks: [results | state.health_checks],
        check_count: state.check_count + 1
    }

    schedule_health_check()

    {:noreply, new_state}
  end

  # ==================== PRIVATE FUNCTIONS ====================

  defp schedule_health_check do
    Process.send_after(self(), :health_check, 60_000) # Cada minuto
  end

  defp perform_health_checks do
    timestamp = DateTime.utc_now()

    checks = [
      check_database(),
      check_sessions(),
      check_users(),
      check_auth_module()
    ]

    failed_checks = Enum.filter(checks, fn {_, status, _} -> status == :error end)

    if length(failed_checks) > 0 do
      for {name, :error, reason} <- failed_checks do
        report_error(:health_check, "Check fallido: #{name}", %{reason: reason})
      end
    end

    %{
      timestamp: timestamp,
      total_checks: length(checks),
      failed_checks: length(failed_checks),
      details: checks
    }
  end

  defp check_database do
    try do
      case Ecto.Adapters.SQL.query(MyVtt.Repo, "SELECT 1") do
        {:ok, _} -> {:database, :ok, "Conexión OK"}
        {:error, reason} -> {:database, :error, inspect(reason)}
      end
    rescue
      e -> {:database, :error, Exception.message(e)}
    end
  end

  defp check_sessions do
    try do
      count = MyVtt.Accounts.Session |> MyVtt.Repo.aggregate(:count, :id)
      
      if count >= 0 do
        {:sessions, :ok, "#{count} sesiones activas"}
      else
        {:sessions, :error, "Conteo negativo de sesiones"}
      end
    rescue
      e -> {:sessions, :error, Exception.message(e)}
    end
  end

  defp check_users do
    try do
      count = MyVtt.Accounts.User |> MyVtt.Repo.aggregate(:count, :id)
      
      if count >= 0 do
        {:users, :ok, "#{count} usuarios registrados"}
      else
        {:users, :error, "Conteo negativo de usuarios"}
      end
    rescue
      e -> {:users, :error, Exception.message(e)}
    end
  end

  defp check_auth_module do
    try do
      # Verificar que el módulo de autenticación responde
      test_result = MyVtt.Accounts.authenticate_user("nonexistent@test.com", "password")
      
      case test_result do
        {:error, :invalid_credentials} -> {:auth, :ok, "Módulo de autenticación funcional"}
        other -> {:auth, :error, "Respuesta inesperada: #{inspect(other)}"}
      end
    rescue
      e -> {:auth, :error, Exception.message(e)}
    end
  end

  defp generate_error_id do
    :crypto.strong_rand_bytes(8) |> Base.encode16(case: :lower)
  end

  defp calculate_severity(category, details) do
    cond do
      category in [:auth_bypass, :security, :database_corruption] -> :critical
      category in [:session_hijack, :permission_escalation] -> :high
      category in [:validation_error, :data_integrity] -> :medium
      true -> :low
    end
  end

  defp count_critical_errors(errors) do
    Enum.count(errors, fn e -> e.severity == :critical end)
  end
end
