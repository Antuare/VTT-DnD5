# Script de inicialización de datos para MyVtt
# Ejecutar con: mix run priv/repo/seeds.exs

alias MyVtt.Repo
alias MyVtt.Tables
alias MyVtt.Tables.Table

IO.puts("🌱 Iniciando seeds de la base de datos...")

# Verificar si ya existe una mesa
case Tables.list_tables() do
  [] ->
    IO.puts("📋 No hay mesas existentes. Creando mesa por defecto...")
    
    # Crear mesa principal con slug conocido
    case Tables.create_table(%{
      name: "Mesa Principal",
      slug: "mesa-principal",
      description: "Mesa predeterminada para jugar D&D y otros juegos de rol.",
      active: true,
      max_players: 10
    }) do
      {:ok, table} ->
        IO.puts("✅ Mesa creada: #{table.name} (slug: #{table.slug})")
        
        # Sembrar datos iniciales
        Tables.seed_table_data(table.id)
        IO.puts("✅ Datos iniciales sembrados (tokens y mensaje de bienvenida)")
      
      {:error, changeset} ->
        IO.puts("❌ Error al crear mesa: #{inspect(changeset.errors)}")
    end
    
    # Crear mesa de ejemplo adicional
    case Tables.create_table(%{
      name: "La Cueva del Dragón",
      slug: "cueva-dragon",
      description: "Una aventura épica en las profundidades de la montaña.",
      active: true,
      max_players: 6
    }) do
      {:ok, table2} ->
        IO.puts("✅ Mesa creada: #{table2.name} (slug: #{table2.slug})")
        Tables.seed_table_data(table2.id)
      
      {:error, changeset} ->
        IO.puts("❌ Error al crear segunda mesa: #{inspect(changeset.errors)}")
    end
  
  tables ->
    IO.puts("ℹ️  Ya existen #{length(tables)} mesas en la base de datos.")
    Enum.each(tables, fn table ->
      IO.puts("   - #{table.name} (#{table.slug})")
    end)
end

IO.puts("\n🎉 Seeds completados exitosamente!")
IO.puts("\n📝 URLs de acceso:")
IO.puts("   - http://localhost:4000/table/mesa-principal")
IO.puts("   - http://localhost:4000/table/cueva-dragon")
