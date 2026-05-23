defmodule MyVtt.Accounts.User do
  @moduledoc """
  Schema para un usuario registrado en el sistema.
  Cada usuario puede tener múltiples jugadores en diferentes mesas.
  """
  
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "users" do
    field :email, :string
    field :username, :string
    field :password_hash, :string
    field :password, :string, virtual: true
    field :password_confirmation, :string, virtual: true
    
    # Relaciones
    has_many :players, MyVtt.Tables.Player, foreign_key: :user_id

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :username, :password, :password_confirmation])
    |> validate_required([:email, :username, :password])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> validate_length(:username, min: 3, max: 50)
    |> validate_length(:password, min: 6, max: 72)
    |> validate_confirmation(:password, required: true)
    |> unique_constraint(:email)
    |> unique_constraint(:username)
    |> put_password_hash()
  end

  @doc """
  Cambioset para registro sin requerir confirmación de contraseña.
  """
  def registration_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :username, :password])
    |> validate_required([:email, :username, :password])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> validate_length(:username, min: 3, max: 50)
    |> validate_length(:password, min: 6, max: 72)
    |> unique_constraint(:email)
    |> unique_constraint(:username)
    |> put_password_hash()
  end

  @doc """
  Cambioset para actualizar perfil (sin password).
  """
  def profile_changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :username])
    |> validate_required([:email, :username])
    |> validate_format(:email, ~r/^[^\s]+@[^\s]+$/, message: "must have the @ sign and no spaces")
    |> validate_length(:email, max: 160)
    |> validate_length(:username, min: 3, max: 50)
    |> unique_constraint(:email)
    |> unique_constraint(:username)
  end

  @doc """
  Cambioset para cambiar contraseña.
  """
  def password_changeset(user, attrs) do
    user
    |> cast(attrs, [:password, :password_confirmation])
    |> validate_required([:password, :password_confirmation])
    |> validate_length(:password, min: 6, max: 72)
    |> validate_confirmation(:password, required: true)
    |> put_password_hash()
  end

  defp put_password_hash(%Ecto.Changeset{valid?: true, changes: %{password: password}} = changeset) do
    put_change(changeset, :password_hash, Bcrypt.hash_pwd_salt(password))
  end

  defp put_password_hash(changeset), do: changeset

  @doc """
  Verifica si la contraseña proporcionada es correcta.
  """
  def verify_password(%__MODULE__{} = user, password) do
    Bcrypt.verify_pass(password, user.password_hash)
  end

  @doc """
  Obtiene todos los jugadores asociados a un usuario.
  """
  def get_players(%__MODULE__{} = user) do
    import Ecto.Query
    alias MyVtt.Repo
    
    from(p in MyVtt.Tables.Player,
      where: p.user_id == ^user.id,
      preload: [:table],
      order_by: [desc: p.inserted_at]
    )
    |> Repo.all()
  end
end
