defmodule MyVttWeb.Auth do
  @moduledoc """
  Módulo de autenticación para Phoenix.
  Proporciona plugs y funciones helper para gestión de sesiones.
  """
  
  import Plug.Conn
  import Phoenix.Component
  alias MyVtt.Accounts
  alias MyVtt.Accounts.Session

  @doc """
  Inicializa el plug de autenticación.
  """
  def init(opts), do: opts

  @doc """
  Plug que verifica la sesión del usuario y lo asigna al conn.
  Se usa en el pipeline :browser.
  """
  def call(conn, _opts) do
    user_id = get_session(conn, :user_id)
    session_token = get_session(conn, :session_token)

    cond do
      # Si hay token de sesión, verificarlo
      session_token ->
        case Accounts.verify_session(session_token) do
          {:ok, session, user} ->
            # Actualizar última actividad
            Session.touch_session(session)
            conn
            |> assign(:current_user, user)
            |> assign(:session_token, session_token)
          
          {:error, :expired_session} ->
            # Sesión expirada, limpiar
            conn
            |> delete_session(:session_token)
            |> delete_session(:user_id)
            |> assign(:current_user, nil)
            |> assign(:session_token, nil)
          
          {:error, _reason} ->
            conn
            |> assign(:current_user, nil)
            |> assign(:session_token, nil)
        end
      
      # Si hay user_id pero no token (legacy), limpiar
      user_id ->
        conn
        |> delete_session(:user_id)
        |> assign(:current_user, nil)
        |> assign(:session_token, nil)
      
      # No hay sesión
      true ->
        conn
        |> assign(:current_user, nil)
        |> assign(:session_token, nil)
    end
  end

  @doc """
  Verifica si el usuario está autenticado.
  Usar en LiveViews que requieren login.
  """
  def require_authenticated_user(socket) do
    case socket.assigns[:current_user] do
      nil ->
        {:cont, redirect_to_login(socket)}
      user ->
        {:cont, assign(socket, :current_user, user)}
    end
  end

  @doc """
  Redirige al login guardando la URL original.
  """
  def redirect_to_login(socket) do
    socket
    |> put_flash(:error, "Debes iniciar sesión para continuar")
    |> redirect(to: "/login")
  end

  @doc """
  Crea una sesión para el usuario y guarda el token en cookies.
  """
  def create_user_session(conn, user, opts \\\\ []) do
    case Accounts.create_session(user, opts) do
      {:ok, token, session} ->
        conn
        |> put_session(:session_token, token)
        |> put_session(:user_id, user.id)
        |> configure_session(renew: true)
      
      {:error, _changeset} ->
        conn
    end
  end

  @doc """
  Elimina la sesión del usuario (logout).
  """
  def delete_user_session(conn) do
    session_token = get_session(conn, :session_token)
    
    if session_token do
      Accounts.delete_session_by_token(session_token)
    end
    
    conn
    |> delete_session(:session_token)
    |> delete_session(:user_id)
    |> configure_session(drop: true)
  end

  @doc """
  Verifica si el usuario actual es GM de una mesa específica.
  """
  def is_gm?(%{assigns: %{current_user: user}}, table_id) when not is_nil(user) do
    MyVtt.Tables.is_gm?(user.id, table_id)
  end

  def is_gm?(_conn, _table_id), do: false

  @doc """
  Obtiene el jugador actual para un usuario en una mesa.
  """
  def get_current_player(%{assigns: %{current_user: user}}, table_id) when not is_nil(user) do
    MyVtt.Tables.get_player_by_user_and_table(user.id, table_id)
  end

  def get_current_player(_conn, _table_id), do: nil
end
