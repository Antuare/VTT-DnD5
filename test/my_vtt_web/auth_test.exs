defmodule MyVttWeb.AuthTest do
  @moduledoc """
  Tests para el módulo de autenticación web (Auth Plug).
  Incluye tests de integración para:
  - Verificación de sesiones en conn
  - Login/logout
  - Redirección de usuarios no autenticados
  - Permisos y roles
  """

  use MyVttWeb.ConnCase
  alias MyVtt.Accounts
  alias MyVttWeb.Auth

  # ==================== HELPERS ====================

  defp create_test_user(attrs \\ %{}) do
    default_attrs = %{
      email: "user#{System.unique_integer([:positive, :monotonic])}@test.com",
      username: "user#{System.unique_integer([:positive, :monotonic])}",
      password: "password123",
      password_confirmation: "password123"
    }

    attrs = Map.merge(default_attrs, attrs)
    {:ok, user} = Accounts.register_user(attrs)
    user
  end

  defp create_session_for_user(user) do
    {:ok, token, session} = Accounts.create_session(user)
    {token, session}
  end

  # ==================== AUTH PLUG ====================

  describe "Auth.call/2" do
    setup do
      user = create_test_user()
      {:ok, token, _session} = create_session_for_user(user)
      {:ok, user: user, token: token}
    end

    test "asigna current_user cuando hay sesión válida", %{conn: conn, token: token, user: user} do
      conn = conn |> put_session(:session_token, token)
      result_conn = Auth.call(conn, [])

      assert result_conn.assigns[:current_user] != nil
      assert result_conn.assigns[:current_user].id == user.id
      assert result_conn.assigns[:session_token] == token
    end

    test "asigna nil cuando no hay sesión", %{conn: conn} do
      result_conn = Auth.call(conn, [])

      assert result_conn.assigns[:current_user] == nil
      assert result_conn.assigns[:session_token] == nil
    end

    test "limpia sesión cuando el token es inválido", %{conn: conn} do
      conn = conn |> put_session(:session_token, "invalid_token")
      result_conn = Auth.call(conn, [])

      assert result_conn.assigns[:current_user] == nil
      assert result_conn.assigns[:session_token] == nil
    end

    test "actualiza last_activity_at en sesiones válidas", %{conn: conn, token: token} do
      # Obtener sesión antes
      session_before = Accounts.get_session_by_token(token)

      conn = conn |> put_session(:session_token, token)
      Auth.call(conn, [])

      # Obtener sesión después
      session_after = Accounts.get_session_by_token(token)

      # La actividad debería haberse actualizado
      assert DateTime.compare(session_after.last_activity_at, session_before.last_activity_at) == :gt
    end
  end

  # ==================== CREATE/DELETE SESSION ====================

  describe "create_user_session/3" do
    setup do
      user = create_test_user()
      {:ok, conn: conn, user: user}
    end

    test "crea sesión y guarda token en cookies", %{conn: conn, user: user} do
      result_conn = Auth.create_user_session(conn, user)

      session_token = get_session(result_conn, :session_token)
      assert session_token != nil
      assert String.length(session_token) > 0

      user_id = get_session(result_conn, :user_id)
      assert user_id == user.id
    end

    test "renueva la sesión para seguridad", %{conn: conn, user: user} do
      result_conn = Auth.create_user_session(conn, user)

      # Verificar que la sesión se renovó
      assert result_conn.resp_cookies["_my_vtt_key"] != nil
    end
  end

  describe "delete_user_session/1" do
    setup do
      user = create_test_user()
      {:ok, token, _session} = create_session_for_user(user)

      conn = build_conn()
      conn = conn |> put_session(:session_token, token) |> put_session(:user_id, user.id)

      {:ok, conn: conn, token: token, user: user}
    end

    test "elimina sesión del usuario", %{conn: conn, token: token} do
      result_conn = Auth.delete_user_session(conn)

      # Verificar que las sesiones fueron eliminadas
      assert get_session(result_conn, :session_token) == nil
      assert get_session(result_conn, :user_id) == nil

      # Verificar que la sesión fue eliminada de la BD
      assert {:error, :not_found} = Accounts.delete_session_by_token(token)
    end

    test "maneja gracefully cuando no hay sesión", %{conn: conn} do
      conn_without_session = delete_session(conn, :session_token)
      result_conn = Auth.delete_user_session(conn_without_session)

      assert result_conn != nil
    end
  end

  # ==================== REQUIRE AUTHENTICATED USER ====================

  describe "require_authenticated_user/1" do
    test "redirige al login si no hay usuario autenticado" do
      socket = build_conn() |> Phoenix.LiveViewTest.live(MyVttWeb.TableLive) |> elem(0)
      socket = assign(socket, :current_user, nil)

      {:cont, result_socket} = Auth.require_authenticated_user(socket)

      # Debería redirigir al login
      assert result_socket.redirected != nil
    end

    test "permite continuar si hay usuario autenticado" do
      user = create_test_user()
      socket = build_conn() |> Phoenix.LiveViewTest.live(MyVttWeb.TableLive) |> elem(0)
      socket = assign(socket, :current_user, user)

      {:cont, result_socket} = Auth.require_authenticated_user(socket)

      # Debería continuar sin redirigir
      assert result_socket.assigns[:current_user] != nil
    end
  end

  # ==================== IS GM CHECK ====================

  describe "is_gm?/2" do
    setup do
      user = create_test_user()
      {:ok, token, _} = create_session_for_user(user)

      conn = build_conn() |> put_session(:session_token, token)
      conn = Auth.call(conn, [])

      {:ok, conn: conn, user: user}
    end

    test "verifica correctamente si un usuario es GM" do
      # Como no hay mesas creadas, debería retornar false
      refute Auth.is_gm?(build_conn(), "nonexistent_table_id")
    end

    test "retorna false si no hay usuario autenticado" do
      conn = build_conn()
      refute Auth.is_gm?(conn, "any_table_id")
    end
  end

  # ==================== SECURITY TESTS ====================

  describe "security_tests" do
    test "previene fijación de sesión" do
      user = create_test_user()
      conn = build_conn()

      # Simular intento de fijación de sesión
      conn_with_preset_session = conn |> put_session(:session_token, "attacker_token")

      # Crear sesión legítima
      result_conn = Auth.create_user_session(conn_with_preset_session, user)

      # El token debería ser diferente al del atacante
      new_token = get_session(result_conn, :session_token)
      assert new_token != "attacker_token"
    end

    test "no expone información sensible en errores" do
      user = create_test_user()
      conn = build_conn()

      # Intentar crear sesión con datos inválidos
      result_conn = Auth.create_user_session(conn, user)

      # No debería haber información sensible en la respuesta
      response = inspect(result_conn)
      refute String.contains?(response, user.password_hash)
    end

    test "maneja tokens malformados gracefulmente" do
      conn = build_conn() |> put_session(:session_token, "<script>alert('xss')</script>")
      result_conn = Auth.call(conn, [])

      assert result_conn.assigns[:current_user] == nil
    end
  end

  # ==================== HEALTH MONITOR INTEGRATION ====================

  describe "health_monitor_integration" do
    test "reporta intentos de acceso no autorizado" do
      conn = build_conn()

      # Simular múltiples intentos de acceso sin autenticación
      for _ <- 1..3 do
        MyVtt.HealthMonitor.report_error(:unauthorized_access, "Intento de acceso sin auth", %{
          path: "/protected",
          ip: "127.0.0.1"
        })
      end

      errors = MyVtt.HealthMonitor.get_errors_by_category(:unauthorized_access)
      assert length(errors) >= 3
    end

    test "monitorea fallos de autenticación" do
      # Simular fallos de autenticación
      for _ <- 1..5 do
        Accounts.authenticate_user("fake@test.com", "wrongpass")
      end

      MyVtt.HealthMonitor.report_error(:auth_failure, "Múltiples fallos de autenticación", %{
        count: 5,
        source: "web"
      })

      status = MyVtt.HealthMonitor.get_health_status()
      assert status.total_errors > 0
    end
  end

  # ==================== EDGE CASES ====================

  describe "edge_cases" do
    test "maneja sesiones concurrentes del mismo usuario" do
      user = create_test_user()

      # Crear múltiples sesiones desde diferentes "dispositivos"
      {:ok, token1, _} = Accounts.create_session(user, user_agent: "Browser1")
      {:ok, token2, _} = Accounts.create_session(user, user_agent: "Browser2")

      conn = build_conn()
      conn = conn |> put_session(:session_token, token1)
      result_conn = Auth.call(conn, [])

      assert result_conn.assigns[:current_user] != nil

      # Ambas sesiones deberían ser válidas
      assert {:ok, _, _} = Accounts.verify_session(token1)
      assert {:ok, _, _} = Accounts.verify_session(token2)
    end

    test "maneja sesiones expiradas durante la verificación" do
      user = create_test_user()
      {:ok, token, session} = Accounts.create_session(user)

      # Expirar sesión manualmente
      expired_at = DateTime.add(DateTime.utc_now(), -1, :day)
      Ecto.Changeset.change(session, expires_at: expired_at) |> MyVtt.Repo.update()

      conn = build_conn() |> put_session(:session_token, token)
      result_conn = Auth.call(conn, [])

      # Debería limpiar la sesión expirada
      assert result_conn.assigns[:current_user] == nil
      assert get_session(result_conn, :session_token) == nil
    end
  end
end
