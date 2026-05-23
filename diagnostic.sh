#!/bin/bash

###############################################################################
# VTT-DnD5 - Script de Diagnóstico Completo del Repositorio
# Analiza todo el código y genera un reporte detallado
###############################################################################

echo "=============================================="
echo "   DIAGNÓSTICO COMPLETO DEL REPOSITORIO VTT"
echo "=============================================="
echo ""
echo "Fecha: $(date)"
echo "Directorio: $(pwd)"
echo ""

# ============================================
# 1. ESTRUCTURA DEL PROYECTO
# ============================================
echo "=============================================="
echo "1. ESTRUCTURA DEL PROYECTO"
echo "=============================================="
echo ""
echo "Archivos principales:"
find . -maxdepth 2 -type f \( -name "*.ex" -o -name "*.exs" -o -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.heex" \) | head -30
echo ""
echo "Total de archivos por extensión:"
find . -type f -name "*.ex" | wc -l | xargs echo "  Archivos .ex (Elixir):"
find . -type f -name "*.exs" | wc -l | xargs echo "  Archivos .exs (Elixir Script):"
find . -type f -name "*.tsx" | wc -l | xargs echo "  Archivos .tsx (React TSX):"
find . -type f -name "*.ts" | wc -l | xargs echo "  Archivos .ts (TypeScript):"
find . -type f -name "*.heex" | wc -l | xargs echo "  Archivos .heex (Phoenix HEEX):"
echo ""

# ============================================
# 2. DEPENDENCIAS
# ============================================
echo "=============================================="
echo "2. DEPENDENCIAS"
echo "=============================================="
echo ""
echo "--- mix.exs (Elixir) ---"
if [ -f "mix.exs" ]; then
    grep -A 20 "defp deps" mix.exs || echo "No se encontró la sección de deps"
else
    echo "⚠ mix.exs no encontrado"
fi
echo ""
echo "--- package.json (Node.js) ---"
if [ -f "assets/package.json" ]; then
    cat assets/package.json | grep -A 30 '"dependencies"'
else
    echo "⚠ assets/package.json no encontrado"
fi
echo ""

# ============================================
# 3. CONFIGURACIÓN
# ============================================
echo "=============================================="
echo "3. CONFIGURACIÓN"
echo "=============================================="
echo ""
echo "--- config/config.exs ---"
if [ -f "config/config.exs" ]; then
    head -40 config/config.exs
else
    echo "⚠ config/config.exs no encontrado"
fi
echo ""

# ============================================
# 4. BASE DE DATOS Y MIGRACIONES
# ============================================
echo "=============================================="
echo "4. BASE DE DATOS Y MIGRACIONES"
echo "=============================================="
echo ""
echo "Migraciones disponibles:"
ls -la priv/repo/migrations/ 2>/dev/null || echo "⚠ No se encontró el directorio de migraciones"
echo ""
echo "Contenido de migraciones:"
for file in priv/repo/migrations/*.exs; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        head -20 "$file"
        echo ""
    fi
done
echo ""

# ============================================
# 5. SCHEMAS DE BASE DE DATOS
# ============================================
echo "=============================================="
echo "5. SCHEMAS DE BASE DE DATOS"
echo "=============================================="
echo ""
echo "--- lib/my_vtt/tables/table.ex ---"
if [ -f "lib/my_vtt/tables/table.ex" ]; then
    head -30 lib/my_vtt/tables/table.ex
else
    echo "⚠ table.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt/tables/token.ex ---"
if [ -f "lib/my_vtt/tables/token.ex" ]; then
    head -30 lib/my_vtt/tables/token.ex
else
    echo "⚠ token.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt/tables/player.ex ---"
if [ -f "lib/my_vtt/tables/player.ex" ]; then
    head -30 lib/my_vtt/tables/player.ex
else
    echo "⚠ player.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt/tables/chat_message.ex ---"
if [ -f "lib/my_vtt/tables/chat_message.ex" ]; then
    head -30 lib/my_vtt/tables/chat_message.ex
else
    echo "⚠ chat_message.ex no encontrado"
fi
echo ""

# ============================================
# 6. CANALES Y LIVEVIEW
# ============================================
echo "=============================================="
echo "6. CANALES Y LIVEVIEW"
echo "=============================================="
echo ""
echo "--- lib/my_vtt_web/channels/table_channel.ex ---"
if [ -f "lib/my_vtt_web/channels/table_channel.ex" ]; then
    head -50 lib/my_vtt_web/channels/table_channel.ex
else
    echo "⚠ table_channel.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt_web/live/table_live.ex ---"
if [ -f "lib/my_vtt_web/live/table_live.ex" ]; then
    head -50 lib/my_vtt_web/live/table_live.ex
else
    echo "⚠ table_live.ex no encontrado"
fi
echo ""

# ============================================
# 7. FRONTEND (REACT/TYPESCRIPT)
# ============================================
echo "=============================================="
echo "7. FRONTEND (REACT/TYPESCRIPT)"
echo "=============================================="
echo ""
echo "--- assets/js/app.ts ---"
if [ -f "assets/js/app.ts" ]; then
    cat assets/js/app.ts
else
    echo "⚠ app.ts no encontrado"
fi
echo ""
echo "--- assets/js/hooks/index.ts ---"
if [ -f "assets/js/hooks/index.ts" ]; then
    cat assets/js/hooks/index.ts
else
    echo "⚠ hooks/index.ts no encontrado"
fi
echo ""
echo "--- assets/js/canvas/engine.ts ---"
if [ -f "assets/js/canvas/engine.ts" ]; then
    head -50 assets/js/canvas/engine.ts
else
    echo "⚠ canvas/engine.ts no encontrado"
fi
echo ""

# ============================================
# 8. COMPONENTES REACT
# ============================================
echo "=============================================="
echo "8. COMPONENTES REACT"
echo "=============================================="
echo ""
echo "Componentes disponibles:"
ls -la assets/js/components/ 2>/dev/null || echo "⚠ No se encontró el directorio de componentes"
echo ""
for file in assets/js/components/*.tsx; do
    if [ -f "$file" ]; then
        echo "--- $file (primeras 30 líneas) ---"
        head -30 "$file"
        echo ""
    fi
done
echo ""

# ============================================
# 9. ROUTER Y ENDPOINT
# ============================================
echo "=============================================="
echo "9. ROUTER Y ENDPOINT"
echo "=============================================="
echo ""
echo "--- lib/my_vtt_web/router.ex ---"
if [ -f "lib/my_vtt_web/router.ex" ]; then
    cat lib/my_vtt_web/router.ex
else
    echo "⚠ router.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt_web/endpoint.ex ---"
if [ -f "lib/my_vtt_web/endpoint.ex" ]; then
    cat lib/my_vtt_web/endpoint.ex
else
    echo "⚠ endpoint.ex no encontrado"
fi
echo ""

# ============================================
# 10. APLICACIÓN Y SUPERVISOR
# ============================================
echo "=============================================="
echo "10. APLICACIÓN Y SUPERVISOR"
echo "=============================================="
echo ""
echo "--- lib/my_vtt/application.ex ---"
if [ -f "lib/my_vtt/application.ex" ]; then
    cat lib/my_vtt/application.ex
else
    echo "⚠ application.ex no encontrado"
fi
echo ""
echo "--- lib/my_vtt/game_state.ex ---"
if [ -f "lib/my_vtt/game_state.ex" ]; then
    head -50 lib/my_vtt/game_state.ex
else
    echo "⚠ game_state.ex no encontrado"
fi
echo ""

# ============================================
# 11. VERIFICACIÓN DE ERRORES COMUNES
# ============================================
echo "=============================================="
echo "11. VERIFICACIÓN DE ERRORES COMUNES"
echo "=============================================="
echo ""

# Verificar si hay módulos incompletos
echo "Buscando funciones con 'TODO' o 'FIXME'..."
grep -r "TODO\|FIXME" --include="*.ex" --include="*.exs" --include="*.ts" --include="*.tsx" . 2>/dev/null || echo "No se encontraron TODO/FIXME"
echo ""

# Verificar imports faltantes
echo "Buscando posibles problemas de importación..."
grep -r "import.*undefined\|cannot find module" --include="*.log" . 2>/dev/null || echo "No se encontraron errores de importación en logs"
echo ""

# Verificar configuración de DB
echo "Verificando configuración de base de datos..."
if grep -q "ecto_sqlite3" mix.exs; then
    echo "✓ SQLite3 configurado como base de datos"
else
    echo "⚠ SQLite3 no parece estar configurado"
fi
echo ""

# Verificar si existe el archivo de seeds
echo "Verificando seeds..."
if [ -f "priv/repo/seeds.exs" ]; then
    echo "✓ seeds.exs encontrado"
    head -20 priv/repo/seeds.exs
else
    echo "⚠ seeds.exs no encontrado"
fi
echo ""

# ============================================
# 12. RESUMEN FINAL
# ============================================
echo "=============================================="
echo "12. RESUMEN FINAL"
echo "=============================================="
echo ""
echo "Estado general del repositorio:"
echo ""

# Contar archivos críticos
files_ok=0
files_missing=0

for file in "mix.exs" "config/config.exs" "lib/my_vtt/application.ex" "lib/my_vtt_web/endpoint.ex" "lib/my_vtt_web/router.ex" "assets/js/app.ts"; do
    if [ -f "$file" ]; then
        ((files_ok++))
    else
        ((files_missing++))
        echo "⚠ Faltante: $file"
    fi
done

echo ""
echo "Archivos críticos encontrados: $files_ok"
echo "Archivos críticos faltantes: $files_missing"
echo ""

if [ $files_missing -eq 0 ]; then
    echo "✓ El repositorio parece estar completo estructuralmente"
else
    echo "⚠ Hay archivos críticos faltantes que deben revisarse"
fi

echo ""
echo "=============================================="
echo "FIN DEL DIAGNÓSTICO"
echo "=============================================="
