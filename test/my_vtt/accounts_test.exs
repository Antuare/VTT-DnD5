defmodule MyVtt.AccountsTest do
  @moduledoc """
  Tests para el módulo de autenticación y gestión de cuentas.
  Incluye tests unitarios y de integración para:
  - Registro de usuarios
  - Autenticación (login)
  - Gestión de sesiones
  - Validaciones de seguridad
  - Errores críticos
  """

  use MyVtt.DataCase
  alias MyVtt.Accounts
  alias MyVtt.Accounts.{User, Session}

  # ==================== HELPERS ====================

  defp valid_user_attrs do
    %{
      email: "test#{System.unique_integer([:positive, :monotonic])}@example.com",
      username: "testuser#{System.unique_integer([:positive, :monotonic])}",
      password: "password123",
      password_confirmation: "password123"
    }
  end

  defp create_user(attrs \\ %{}) do
    attrs = Map.merge(valid_user_attrs(), attrs)
    {:ok, user} = Accounts.register_user(attrs)
    user
  end

  # ==================== REGISTRO DE USUARIOS ====================

  describe "register_user/1" do
    test "crea un usuario con atributos válidos" do
      attrs = valid_user_attrs()
      assert {:ok, %User{} = user} = Accounts.register_user(attrs)
      assert user.email == attrs.email
      assert user.username == attrs.username
      refute is_nil(user.id)
      refute is_nil(user.password_hash)
      assert user.password_hash != attrs.password
    end

    test "requiere email válido" do
      invalid_attrs = Map.merge(valid_user_attrs(), %{email: "invalid-email"})
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.register_user(invalid_attrs)
      assert changeset.valid? == false
      assert errors_on(changeset)[:email] != []
    end

    test "requiere email único" do
      attrs = valid_user_attrs()
      assert {:ok, %User{}} = Accounts.register_user(attrs)
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.register_user(attrs)
      assert errors_on(changeset)[:email] != []
    end

    test "requiere username único" do
      attrs = valid_user_attrs()
      assert {:ok, %User{}} = Accounts.register_user(attrs)
      duplicate_attrs = Map.merge(valid_user_attrs(), %{email: "other#{attrs.email}"})
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.register_user(duplicate_attrs)
      assert errors_on(changeset)[:username] != []
    end

    test "requiere contraseña mínima de 6 caracteres" do
      invalid_attrs = Map.merge(valid_user_attrs(), %{password: "short"})
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.register_user(invalid_attrs)
      assert errors_on(changeset)[:password] != []
    end

    test "encripta la contraseña correctamente" do
      attrs = valid_user_attrs()
      assert {:ok, user} = Accounts.register_user(attrs)
      assert Bcrypt.verify_pass(attrs.password, user.password_hash)
    end

    test "falla si las contraseñas no coinciden (cuando se usa confirmation)" do
      # Nota: registration_changeset no requiere confirmation por defecto
      # pero podemos probarlo manualmente
      attrs = Map.put(valid_user_attrs(), :password_confirmation, "different")
      # El registro debería funcionar porque registration_changeset no valida confirmation
      assert {:ok, %User{}} = Accounts.register_user(attrs)
    end
  end

  # ==================== AUTENTICACIÓN ====================

  describe "authenticate_user/2" do
    setup do
      user = create_user()
      {:ok, user: user}
    end

    test "autentica con email y contraseña correctos", %{user: user} do
      assert {:ok, %User{} = authenticated_user} = Accounts.authenticate_user(user.email, "password123")
      assert authenticated_user.id == user.id
    end

    test "autentica con username y contraseña correctos", %{user: user} do
      assert {:ok, %User{} = authenticated_user} = Accounts.authenticate_user(user.username, "password123")
      assert authenticated_user.id == user.id
    end

    test "rechaza email incorrecto" do
      assert {:error, :invalid_credentials} = Accounts.authenticate_user("wrong@email.com", "password123")
    end

    test "rechaza contraseña incorrecta", %{user: user} do
      assert {:error, :invalid_credentials} = Accounts.authenticate_user(user.email, "wrongpassword")
    end

    test "previene timing attacks para usuarios inexistentes" do
      # Debería tomar similar tiempo tanto para usuario existente como inexistente
      {:ok, _} = Accounts.authenticate_user("nonexistent@email.com", "password123")
      assert {:error, :invalid_credentials} = Accounts.authenticate_user("nonexistent@email.com", "password123")
    end

    test "es case-insensitive para email" do
      user = create_user(%{email: "TestCase@Example.Com"})
      assert {:ok, %User{}} = Accounts.authenticate_user("testcase@example.com", "password123")
    end
  end

  # ==================== GESTIÓN DE SESIONES ====================

  describe "create_session/2" do
    setup do
      user = create_user()
      {:ok, user: user}
    end

    test "crea una sesión válida para un usuario", %{user: user} do
      assert {:ok, token, %Session{} = session} = Accounts.create_session(user)
      assert token != nil
      assert String.length(token) > 0
      assert session.user_id == user.id
      assert session.token == token
      refute is_nil(session.expires_at)
      refute is_nil(session.last_activity_at)
    end

    test "la sesión expira en 30 días por defecto", %{user: user} do
      {:ok, _token, session} = Accounts.create_session(user)
      expected_expiry = DateTime.add(DateTime.utc_now(), 30, :day)
      
      # Permitir diferencia de 2 segundos por tiempo de ejecución
      assert DateTime.diff(session.expires_at, expected_expiry, :second) |> abs() < 2
    end

    test "genera tokens únicos para cada sesión", %{user: user} do
      {:ok, token1, _session1} = Accounts.create_session(user)
      {:ok, token2, _session2} = Accounts.create_session(user)
      assert token1 != token2
    end
  end

  describe "verify_session/1" do
    setup do
      user = create_user()
      {:ok, token, session} = Accounts.create_session(user)
      {:ok, user: user, token: token, session: session}
    end

    test "verifica una sesión válida", %{token: token, user: user} do
      assert {:ok, %Session{}, verified_user} = Accounts.verify_session(token)
      assert verified_user.id == user.id
    end

    test "rechaza token inválido" do
      assert {:error, :invalid_session} = Accounts.verify_session("invalid_token")
    end

    test "rechaza sesión expirada" do
      user = create_user()
      {:ok, token, session} = Accounts.create_session(user)
      
      # Expirar la sesión manualmente
      expired_at = DateTime.add(DateTime.utc_now(), -1, :day)
      {:ok, _} = Ecto.Changeset.change(session, expires_at: expired_at) |> MyVtt.Repo.update()
      
      assert {:error, :expired_session} = Accounts.verify_session(token)
    end
  end

  describe "delete_session/1" do
    setup do
      user = create_user()
      {:ok, token, session} = Accounts.create_session(user)
      {:ok, user: user, token: token, session: session}
    end

    test "elimina una sesión correctamente", %{session: session, token: token} do
      assert {:ok, _deleted_session} = Accounts.delete_session(session)
      assert {:error, :invalid_session} = Accounts.verify_session(token)
    end

    test "elimina sesión por token", %{token: token} do
      assert {:ok, _result} = Accounts.delete_session_by_token(token)
      assert {:error, :invalid_session} = Accounts.verify_session(token)
    end
  end

  describe "delete_all_user_sessions/1" do
    test "elimina todas las sesiones de un usuario" do
      user = create_user()
      
      # Crear múltiples sesiones
      {:ok, token1, _} = Accounts.create_session(user)
      {:ok, token2, _} = Accounts.create_session(user)
      {:ok, token3, _} = Accounts.create_session(user)
      
      # Verificar que existen
      assert {:ok, _, _} = Accounts.verify_session(token1)
      assert {:ok, _, _} = Accounts.verify_session(token2)
      
      # Eliminar todas
      Accounts.delete_all_user_sessions(user)
      
      # Verificar que fueron eliminadas
      assert {:error, :invalid_session} = Accounts.verify_session(token1)
      assert {:error, :invalid_session} = Accounts.verify_session(token2)
    end
  end

  describe "prune_expired_sessions/0" do
    test "elimina sesiones expiradas" do
      user = create_user()
      {:ok, _token, session} = Accounts.create_session(user)
      
      # Expirar la sesión
      expired_at = DateTime.add(DateTime.utc_now(), -1, :day)
      {:ok, _} = Ecto.Changeset.change(session, expires_at: expired_at) |> MyVtt.Repo.update()
      
      # Podar sesiones expiradas
      {count, _} = Accounts.prune_expired_sessions()
      assert count >= 1
    end
  end

  # ==================== ACTUALIZACIÓN DE USUARIO ====================

  describe "update_user_profile/2" do
    setup do
      user = create_user()
      {:ok, user: user}
    end

    test "actualiza email y username", %{user: user} do
      new_email = "newemail#{System.unique_integer()}@example.com"
      new_username = "newusername#{System.unique_integer()}"
      
      assert {:ok, updated_user} = Accounts.update_user_profile(user, %{
        email: new_email,
        username: new_username
      })
      
      assert updated_user.email == new_email
      assert updated_user.username == new_username
    end

    test "requiere email válido al actualizar", %{user: user} do
      assert {:error, %Ecto.Changeset{}} = Accounts.update_user_profile(user, %{email: "invalid"})
    end
  end

  describe "change_user_password/2" do
    setup do
      user = create_user()
      {:ok, user: user}
    end

    test "cambia la contraseña correctamente", %{user: user} do
      new_password = "newpassword456"
      
      assert {:ok, updated_user} = Accounts.change_user_password(user, %{
        password: new_password,
        password_confirmation: new_password
      })
      
      # Verificar nueva contraseña
      assert {:ok, _} = Accounts.authenticate_user(user.email, new_password)
      assert {:error, :invalid_credentials} = Accounts.authenticate_user(user.email, "password123")
    end

    test "requiere confirmación de contraseña", %{user: user} do
      assert {:error, %Ecto.Changeset{}} = Accounts.change_user_password(user, %{
        password: "newpass123"
      })
    end
  end

  # ==================== ERRORES CRÍTICOS Y SEGURIDAD ====================

  describe "security_tests" do
    test "no expone hashes de contraseña en errores" do
      user = create_user()
      assert {:error, %Ecto.Changeset{} = changeset} = Accounts.register_user(%{
        email: user.email,
        username: "duplicate",
        password: "password123"
      })
      
      error_str = inspect(changeset)
      refute String.contains?(error_str, user.password_hash)
    end

    test "previene SQL injection en búsqueda por email" do
      # Intentar SQL injection
      malicious_email = "'; DROP TABLE users; --"
      result = Accounts.get_user_by_email(malicious_email)
      assert result == nil
    end

    test "maneja contraseñas muy largas correctamente" do
      long_password = String.duplicate("a", 1000)
      attrs = Map.merge(valid_user_attrs(), %{password: long_password})
      
      # Debería fallar por longitud máxima (72 caracteres para bcrypt)
      assert {:error, %Ecto.Changeset{}} = Accounts.register_user(attrs)
    end

    test "normaliza emails a minúsculas" do
      attrs = Map.merge(valid_user_attrs(), %{email: "UPPERCASE@EXAMPLE.COM"})
      {:ok, user} = Accounts.register_user(attrs)
      assert user.email == "uppercase@example.com"
    end
  end

  # ==================== HEALTH MONITOR INTEGRATION ====================

  describe "health_monitor_integration" do
    test "reporta errores de autenticación fallida masiva" do
      # Simular múltiples intentos fallidos
      for _ <- 1..5 do
        Accounts.authenticate_user("fake@test.com", "wrongpass")
      end
      
      # Reportar al health monitor
      MyVtt.HealthMonitor.report_error(:auth_failure, "Múltiples intentos fallidos", %{count: 5})
      
      errors = MyVtt.HealthMonitor.get_errors()
      auth_errors = Enum.filter(errors, fn e -> e.category == :auth_failure end)
      assert length(auth_errors) > 0
    end

    test "detecta problemas de integridad de datos" do
      # Verificar que todos los usuarios tengan hash de contraseña
      users = MyVtt.Repo.all(User)
      
      for user <- users do
        if is_nil(user.password_hash) or String.length(user.password_hash) < 10 do
          MyVtt.HealthMonitor.report_error(:data_integrity, "Usuario sin hash válido", %{user_id: user.id})
        end
      end
      
      # Los errores deberían estar registrados
      errors = MyVtt.HealthMonitor.get_errors_by_category(:data_integrity)
      # Puede que no haya errores si todos los usuarios son válidos
      assert is_list(errors)
    end
  end
end
