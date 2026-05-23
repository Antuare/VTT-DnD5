defmodule MyVtt.Accounts.Session do
  @moduledoc """
  Schema para sesiones de usuario.
  Almacena tokens de sesión para autenticación persistente.
  """
  
  use Ecto.Schema
  import Ecto.Changeset
  alias MyVtt.Accounts

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "sessions" do
    field :token, :string
    field :user_agent, :string
    field :remote_ip, :string
    field :expires_at, :utc_datetime
    field :last_activity_at, :utc_datetime
    
    # Relaciones
    belongs_to :user, MyVtt.Accounts.User, type: :binary_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(session, attrs) do
    session
    |> cast(attrs, [:user_id, :token, :user_agent, :remote_ip, :expires_at, :last_activity_at])
    |> validate_required([:user_id, :token])
    |> put_token()
    |> put_expiration()
    |> unique_constraint(:token)
    |> foreign_key_constraint(:user_id)
  end

  defp put_token(%Ecto.Changeset{valid?: true, changes: %{token: nil}} = changeset) do
    put_change(changeset, :token, Accounts.generate_session_token())
  end

  defp put_token(changeset), do: changeset

  defp put_expiration(%Ecto.Changeset{valid?: true} = changeset) do
    # Sesiones expiran en 30 días por defecto
    expires_at = DateTime.add(DateTime.utc_now(), 30, :day)
    last_activity = DateTime.utc_now()
    
    changeset
    |> put_change(:expires_at, expires_at)
    |> put_change(:last_activity_at, last_activity)
  end

  defp put_expiration(changeset), do: changeset

  @doc """
  Obtiene una sesión por token.
  """
  def get_by_token(token) when is_binary(token) do
    import Ecto.Query
    alias MyVtt.Repo
    
    query = from(s in __MODULE__,
      where: s.token == ^token,
      preload: [:user]
    )
    Repo.one(query)
  end

  @doc """
  Obtiene todas las sesiones de un usuario.
  """
  def by_user(user_id) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(s in __MODULE__,
      where: s.user_id == ^user_id,
      order_by: [desc: s.last_activity_at]
    )
    |> Repo.all()
  end

  @doc """
  Verifica si una sesión es válida (no expirada).
  """
  def is_valid?(%__MODULE__{} = session) do
    DateTime.compare(DateTime.utc_now(), session.expires_at) == :lt
  end

  @doc """
  Actualiza la última actividad de una sesión.
  """
  def touch_session(%__MODULE__{} = session) do
    session
    |> change(%{last_activity_at: DateTime.utc_now()})
    |> MyVtt.Repo.update()
  end

  @doc """
  Elimina todas las sesiones expiradas.
  """
  def prune_expired do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(s in __MODULE__,
      where: s.expires_at < ^DateTime.utc_now()
    )
    |> Repo.delete_all()
  end
end
