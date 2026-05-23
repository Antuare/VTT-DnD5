#!/bin/bash

###############################################################################
# VTT-DnD5 - Script de Inicio y Diagnóstico
# Este script configura, verifica e inicia la aplicación VTT
###############################################################################

set -e  # Detener en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar dependencias
check_dependencies() {
    print_header "VERIFICANDO DEPENDENCIAS"
    
    local missing_deps=0
    
    # Verificar Elixir
    if command -v elixir &> /dev/null; then
        print_success "Elixir instalado: $(elixir --version | head -1)"
    else
        print_error "Elixir no está instalado"
        missing_deps=1
    fi
    
    # Verificar Erlang
    if command -v erl &> /dev/null; then
        print_success "Erlang/OTP instalado: $(erl -eval 'erlang:display(erlang:system_info(otp_release)), halt().' -noshell)"
    else
        print_error "Erlang no está instalado"
        missing_deps=1
    fi
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        print_success "Node.js instalado: $(node --version)"
    else
        print_error "Node.js no está instalado"
        missing_deps=1
    fi
    
    # Verificar npm
    if command -v npm &> /dev/null; then
        print_success "npm instalado: $(npm --version)"
    else
        print_error "npm no está instalado"
        missing_deps=1
    fi
    
    # Verificar mix
    if command -v mix &> /dev/null; then
        print_success "Mix disponible: $(mix --version | head -1)"
    else
        print_error "Mix no está disponible"
        missing_deps=1
    fi
    
    if [ $missing_deps -eq 1 ]; then
        print_error "Faltan dependencias críticas. Por favor instálalas antes de continuar."
        exit 1
    fi
}

# Instalar dependencias de Elixir
install_elixir_deps() {
    print_header "INSTALANDO DEPENDENCIAS DE ELIXIR"
    
    if [ -f "mix.exs" ]; then
        mix deps.get
        print_success "Dependencias de Elixir instaladas"
    else
        print_error "mix.exs no encontrado"
        exit 1
    fi
}

# Instalar dependencias de Node.js
install_node_deps() {
    print_header "INSTALANDO DEPENDENCIAS DE NODE.JS"
    
    if [ -d "assets" ] && [ -f "assets/package.json" ]; then
        cd assets
        npm install
        cd ..
        print_success "Dependencias de Node.js instaladas"
    else
        print_warning "assets/package.json no encontrado, saltando instalación de npm"
    fi
}

# Configurar base de datos
setup_database() {
    print_header "CONFIGURANDO BASE DE DATOS"
    
    # Crear base de datos
    mix ecto.create || print_warning "La base de datos ya existe o hubo un error"
    
    # Ejecutar migraciones
    mix ecto.migrate
    print_success "Base de datos configurada y migrada"
    
    # Sembrar datos iniciales (opcional)
    read -p "¿Ejecutar seeds para datos de ejemplo? (y/n): " run_seeds
    if [ "$run_seeds" = "y" ]; then
        mix run priv/repo/seeds.exs
        print_success "Datos iniciales sembrados"
    fi
}

# Compilar assets frontend
build_assets() {
    print_header "COMPILANDO ASSETS FRONTEND"
    
    if [ -d "assets" ] && [ -f "assets/package.json" ]; then
        cd assets
        npm run build
        cd ..
        print_success "Assets compilados exitosamente"
    else
        print_warning "No se encontró assets/package.json"
    fi
}

# Iniciar servidor
start_server() {
    print_header "INICIANDO SERVIDOR VTT"
    
    echo -e "${GREEN}El servidor se iniciará en http://localhost:4000${NC}"
    echo -e "${YELLOW}Presiona Ctrl+C para detener${NC}\n"
    
    mix phx.server
}

# Ejecutar diagnóstico completo
run_diagnostic() {
    print_header "EJECUTANDO DIAGNÓSTICO COMPLETO"
    
    # Guardar diagnóstico en archivo
    ./diagnostic.sh > diagnostico_output.txt 2>&1 || true
    print_success "Diagnóstico guardado en diagnostico_output.txt"
}

# Mostrar menú de opciones
show_menu() {
    print_header "VTT-DnD5 - MENÚ DE INICIO"
    
    echo "Selecciona una opción:"
    echo "1. Instalación completa (deps + DB + assets)"
    echo "2. Solo instalar dependencias"
    echo "3. Configurar base de datos"
    echo "4. Compilar assets"
    echo "5. Iniciar servidor"
    echo "6. Ejecutar diagnóstico"
    echo "7. Salir"
    echo ""
    read -p "Opción [1-7]: " option
    
    case $option in
        1)
            check_dependencies
            install_elixir_deps
            install_node_deps
            setup_database
            build_assets
            start_server
            ;;
        2)
            check_dependencies
            install_elixir_deps
            install_node_deps
            ;;
        3)
            setup_database
            ;;
        4)
            build_assets
            ;;
        5)
            start_server
            ;;
        6)
            run_diagnostic
            ;;
        7)
            echo "¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "Opción inválida"
            show_menu
            ;;
    esac
}

# Script principal
main() {
    cd "$(dirname "$0")"
    
    # Si se pasa --auto como argumento, ejecutar instalación completa sin preguntas
    if [ "$1" = "--auto" ]; then
        check_dependencies
        install_elixir_deps
        install_node_deps
        mix ecto.create || true
        mix ecto.migrate
        build_assets
        start_server
    else
        show_menu
    fi
}

# Ejecutar script
main "$@"
