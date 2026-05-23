defmodule MyVtt.HealthMonitorTest do
  @moduledoc """
  Tests para el HealthMonitor GenServer.
  Verifica que el sistema de monitoreo de salud funcione correctamente:
  - Registro de errores
  - Clasificación por severidad
  - Health checks automáticos
  - Reportes de estado
  """

  use ExUnit.Case, async: true
  alias MyVtt.HealthMonitor

  # ==================== SETUP ====================

  setup do
    # Limpiar errores antes de cada test
    if Process.whereis(HealthMonitor) do
      HealthMonitor.clear_errors()
    else
      # Iniciar el GenServer si no está corriendo
      {:ok, _pid} = HealthMonitor.start_link()
    end

    :ok
  end

  # ==================== ERROR REPORTING ====================

  describe "report_error/3" do
    test "registra un error correctamente" do
      HealthMonitor.report_error(:test_category, "Test error message", %{detail: "value"})

      errors = HealthMonitor.get_errors()
      assert length(errors) == 1

      error = hd(errors)
      assert error.category == :test_category
      assert error.message == "Test error message"
      assert error.details == %{detail: "value"}
      assert error.severity != nil
      assert error.timestamp != nil
      assert error.id != nil
    end

    test "registra múltiples errores" do
      HealthMonitor.report_error(:cat1, "Error 1")
      HealthMonitor.report_error(:cat2, "Error 2")
      HealthMonitor.report_error(:cat1, "Error 3")

      errors = HealthMonitor.get_errors()
      assert length(errors) == 3
    end

    test "funciona sin detalles opcionales" do
      HealthMonitor.report_error(:simple, "Simple error")

      errors = HealthMonitor.get_errors()
      assert length(errors) == 1
      assert hd(errors).details == %{}
    end
  end

  describe "get_errors_by_category/1" do
    test "filtra errores por categoría" do
      HealthMonitor.report_error(:auth, "Auth error 1")
      HealthMonitor.report_error(:database, "DB error")
      HealthMonitor.report_error(:auth, "Auth error 2")

      auth_errors = HealthMonitor.get_errors_by_category(:auth)
      assert length(auth_errors) == 2

      db_errors = HealthMonitor.get_errors_by_category(:database)
      assert length(db_errors) == 1

      other_errors = HealthMonitor.get_errors_by_category(:other)
      assert length(other_errors) == 0
    end
  end

  describe "clear_errors/0" do
    test "limpia todos los errores" do
      HealthMonitor.report_error(:test, "Error 1")
      HealthMonitor.report_error(:test, "Error 2")

      assert length(HealthMonitor.get_errors()) == 2

      HealthMonitor.clear_errors()

      assert length(HealthMonitor.get_errors()) == 0
    end
  end

  # ==================== SEVERITY CLASSIFICATION ====================

  describe "severity_classification" do
    test "clasifica errores críticos correctamente" do
      HealthMonitor.report_error(:auth_bypass, "Intento de bypass de autenticación")
      HealthMonitor.report_error(:security, "Brecha de seguridad")
      HealthMonitor.report_error(:database_corruption, "Corrupción de datos")

      errors = HealthMonitor.get_errors()
      critical_errors = Enum.filter(errors, fn e -> e.severity == :critical end)
      assert length(critical_errors) == 3
    end

    test "clasifica errores de alta severidad" do
      HealthMonitor.report_error(:session_hijack, "Secuestro de sesión")
      HealthMonitor.report_error(:permission_escalation, "Escalación de privilegios")

      errors = HealthMonitor.get_errors()
      high_errors = Enum.filter(errors, fn e -> e.severity == :high end)
      assert length(high_errors) == 2
    end

    test "clasifica errores de severidad media" do
      HealthMonitor.report_error(:validation_error, "Error de validación")
      HealthMonitor.report_error(:data_integrity, "Problema de integridad")

      errors = HealthMonitor.get_errors()
      medium_errors = Enum.filter(errors, fn e -> e.severity == :medium end)
      assert length(medium_errors) == 2
    end

    test "clasifica errores de baja severidad por defecto" do
      HealthMonitor.report_error(:unknown, "Error desconocido")

      errors = HealthMonitor.get_errors()
      low_errors = Enum.filter(errors, fn e -> e.severity == :low end)
      assert length(low_errors) == 1
    end
  end

  # ==================== HEALTH STATUS ====================

  describe "get_health_status/0" do
    test "retorna estado saludable sin errores" do
      HealthMonitor.clear_errors()

      status = HealthMonitor.get_health_status()

      assert status.healthy == true
      assert status.total_errors == 0
      assert status.critical_errors == 0
      assert status.uptime >= 0
    end

    test "retorna estado no saludable con errores" do
      HealthMonitor.report_error(:critical, "Error crítico")

      status = HealthMonitor.get_health_status()

      assert status.healthy == false
      assert status.total_errors > 0
    end

    test "cuenta errores críticos correctamente" do
      HealthMonitor.report_error(:auth_bypass, "Critical 1")
      HealthMonitor.report_error(:security, "Critical 2")
      HealthMonitor.report_error(:low_priority, "Low severity")

      status = HealthMonitor.get_health_status()
      assert status.critical_errors == 2
      assert status.total_errors == 3
    end
  end

  # ==================== HEALTH CHECKS ====================

  describe "run_health_check/0" do
    test "ejecuta health checks y retorna resultados" do
      result = HealthMonitor.run_health_check()

      assert result.timestamp != nil
      assert result.total_checks >= 4 # database, sessions, users, auth
      assert result.failed_checks >= 0
      assert result.details != nil
    end

    test "detecta problemas de base de datos (si los hay)" do
      result = HealthMonitor.run_health_check()

      db_check = Enum.find(result.details, fn {name, _, _} -> name == :database end)
      assert db_check != nil
      
      {_name, status, _message} = db_check
      # Debería ser :ok en ambiente de test con DB configurada
      assert status in [:ok, :error]
    end

    test "verifica módulo de autenticación" do
      result = HealthMonitor.run_health_check()

      auth_check = Enum.find(result.details, fn {name, _, _} -> name == :auth end)
      assert auth_check != nil
    end
  end

  # ==================== CRITICAL ERROR SCENARIOS ====================

  describe "critical_error_scenarios" do
    test "detecta múltiples intentos de autenticación fallidos" do
      # Simular ataque de fuerza bruta
      for i <- 1..10 do
        HealthMonitor.report_error(:auth_failure, "Intento fallido #{i}", %{
          ip: "192.168.1.#{i}",
          username: "admin"
        })
      end

      errors = HealthMonitor.get_errors_by_category(:auth_failure)
      assert length(errors) == 10

      status = HealthMonitor.get_health_status()
      assert status.total_errors >= 10
    end

    test "monitorea sesiones expiradas masivamente" do
      HealthMonitor.report_error(:session_issue, "Múltiples sesiones expiradas inesperadamente", %{
        count: 50,
        possible_cause: "clock_skew"
      })

      errors = HealthMonitor.get_errors_by_category(:session_issue)
      assert length(errors) == 1
      assert hd(errors).severity == :low
    end

    test "alerta sobre corrupción potencial de datos" do
      HealthMonitor.report_error(:database_corruption, "Checksum inválido en tabla users", %{
        table: "users",
        affected_rows: 5
      })

      status = HealthMonitor.get_health_status()
      assert status.critical_errors >= 1
    end
  end

  # ==================== CONCURRENT ACCESS ====================

  describe "concurrent_access" do
    test "maneja reportes concurrentes de errores" do
      # Ejecutar múltiples procesos reportando errores simultáneamente
      tasks = for i <- 1..20 do
        Task.async(fn ->
          HealthMonitor.report_error(:concurrent, "Error #{i}", %{process: i})
        end)
      end

      Task.await_many(tasks)

      errors = HealthMonitor.get_errors_by_category(:concurrent)
      assert length(errors) == 20
    end

    test "lecturas concurrentes no bloquean escrituras" do
      # Iniciar tarea de lectura continua
      reader = Task.async(fn ->
        for _ <- 1..10 do
          HealthMonitor.get_errors()
          Process.sleep(10)
        end
      end)

      # Escribir errores mientras se lee
      for i <- 1..10 do
        HealthMonitor.report_error(:concurrent_test, "Error #{i}")
      end

      Task.await(reader)

      errors = HealthMonitor.get_errors()
      assert length(errors) >= 10
    end
  end

  # ==================== EDGE CASES ====================

  describe "edge_cases" do
    test "maneja mensajes de error vacíos" do
      HealthMonitor.report_error(:empty, "")
      errors = HealthMonitor.get_errors()
      assert length(errors) == 1
      assert hd(errors).message == ""
    end

    test "maneja detalles muy grandes" do
      large_detail = String.duplicate("x", 10000)
      HealthMonitor.report_error(:large, "Large details", %{data: large_detail})

      errors = HealthMonitor.get_errors()
      assert length(errors) == 1
      assert String.length(inspect(hd(errors).details)) > 10000
    end

    test "genera IDs únicos para cada error" do
      HealthMonitor.report_error(:duplicate_test, "Error 1")
      HealthMonitor.report_error(:duplicate_test, "Error 2")

      errors = HealthMonitor.get_errors()
      ids = Enum.map(errors, fn e -> e.id end)
      assert length(Enum.uniq(ids)) == 2
    end
  end

  # ==================== INTEGRATION WITH ACCOUNTS ====================

  describe "integration_with_accounts" do
    test "reporta errores de autenticación del mundo real" do
      # Intentos reales de autenticación fallida
      MyVtt.Accounts.authenticate_user("nonexistent@test.com", "wrongpass")
      
      HealthMonitor.report_error(:auth_failure_real, "Fallo de autenticación detectado", %{
        identifier: "nonexistent@test.com"
      })

      errors = HealthMonitor.get_errors_by_category(:auth_failure_real)
      assert length(errors) == 1
    end

    test "monitorea creación masiva de usuarios" do
      # Simular registro masivo sospechoso
      for i <- 1..5 do
        HealthMonitor.report_error(:mass_registration, "Registro #{i}", %{
          pattern: "automated"
        })
      end

      status = HealthMonitor.get_health_status()
      assert status.total_errors >= 5
    end
  end
end
