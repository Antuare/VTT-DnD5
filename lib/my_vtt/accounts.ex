defmodule MyVtt.Accounts do
  @moduledoc """
  Contexto para gestión de cuentas de usuario, autenticación y sesiones.
  Proporciona funciones para registro, login, logout y gestión de sesiones.
  """
  
  import Ecto.Query, warn: false
  alias MyVtt.Repo
  alias MyVtt.Accounts.{User, Session}

  # ==================== USERS ====================
  
  @doc """
  Lista todos los usuarios (para admin).
  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Obtiene un usuario por ID.
  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Obtiene un usuario por email.
  """
  def get_user_by_email(email) when is_binary(email) do
    Repo.get_by(User, email: String.downcase(email))
  end

  @doc """
  Obtiene un usuario por username.
  """
  def get_user_by_username(username) when is_binary(username) do
    Repo.get_by(User, username: username)
  end

  @doc """
  Obtiene un usuario por email o username.
  """
  def get_user_by_email_or_username(identifier) when is_binary(identifier) do
    query = from(u in User,
      where: u.email == ^String.downcase(identifier) or u.username == ^identifier,
      select: u
    )
    Repo.one(query)
  end

  @doc """
  Registra un nuevo usuario.
  Returns {:ok, user} si el registro es exitoso, {:error, changeset} si falla.
  """
  def register_user(attrs \\\\ %{}) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Autentica un usuario con email/username y password.
  Returns {:ok, user} si las credenciales son correctas, {:error, :invalid_credentials} si no.
  """
  def authenticate_user(identifier, password) do
    user = get_user_by_email_or_username(identifier)
    
    case user do
      nil ->
        Bcrypt.no_user_verify()
        {:error, :invalid_credentials}
      %User{} = user ->
        if User.verify_password(user, password) do
          {:ok, user}
        else
          {:error, :invalid_credentials}
        end
    end
  end

  @doc """
  Actualiza el perfil de un usuario.
  """
  def update_user_profile(%User{} = user, attrs) do
    user
    |> User.profile_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Cambia la contraseña de un usuario.
  """
  def change_user_password(%User{} = user, attrs) do
    user
    |> User.password_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Elimina un usuario (y todas sus sesiones y jugadores asociados).
  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  # ==================== SESSIONS ====================
  
  @doc """
  Crea una nueva sesión para un usuario.
  Devuelve el token de sesión que se usará en cookies/headers.
  """
  def create_session(%User{} = user, opts \\\\ []) do
    session_attrs = %{
      user_id: user.id,
      user_agent: opts[:user_agent],
      remote_ip: opts[:remote_ip]
    }
    
    case %Session{}
         |> Session.changeset(session_attrs)
         |> Repo.insert() do
      {:ok, session} -> {:ok, session.token, session}
      {:error, changeset} -> {:error, changeset}
    end
  end

  @doc """
  Obtiene una sesión por token.
  """
  def get_session_by_token(token) when is_binary(token) do
    Session.get_by_token(token)
  end

  @doc """
  Verifica si una sesión es válida y retorna el usuario asociado.
  """
  def verify_session(token) when is_binary(token) do
    case get_session_by_token(token) do
      nil -> {:error, :invalid_session}
      %Session{} = session ->
        if Session.is_valid?(session) do
          {:ok, session, get_user!(session.user_id)}
        else
          {:error, :expired_session}
        end
    end
  end

  @doc """
  Elimina una sesión (logout).
  """
  def delete_session(%Session{} = session) do
    Repo.delete(session)
  end

  @doc """
  Elimina una sesión por token.
  """
  def delete_session_by_token(token) do
    case get_session_by_token(token) do
      nil -> {:error, :not_found}
      session -> delete_session(session)
    end
  end

  @doc """
  Elimina todas las sesiones de un usuario (logout everywhere).
  """
  def delete_all_user_sessions(%User{} = user) do
    Session.by_user(user.id)
    |> Repo.delete_all()
  end

  @doc """
  Limpia sesiones expiradas.
  """
  def prune_expired_sessions do
    Session.prune_expired()
  end

  # ==================== UTILIDADES ====================
  
  @doc """
  Genera un token seguro para sesiones.
  """
  def generate_session_token do
    :crypto.strong_rand_bytes(32)
    |> Base.encode16(case: :lower)
  end
end
