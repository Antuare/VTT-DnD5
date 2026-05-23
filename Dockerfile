# Dockerfile optimizado para Burrito
# Build stage para Elixir

FROM hexpm/elixir:1.15.7-erlang-26.1.2-debian-bullseye-20231009-slim AS builder

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    curl \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar archivos de configuración de Mix
COPY mix.exs mix.lock ./

# Obtener dependencias de Elixir
RUN mix local.hex --force && \
    mix local.rebar --force && \
    mix deps.get --only prod

# Copiar el código fuente
COPY config config
COPY lib lib
COPY priv priv
COPY assets assets

# Compilar la aplicación
RUN mix compile

# Construir assets del frontend
RUN cd assets && \
    npm install --production && \
    npm run build

# Generar release con Burrito
RUN mix burrito.build

# Runtime stage minimalista
FROM debian:bullseye-slim

# Instalar dependencias mínimas para ejecutar la aplicación
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libncurses5 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar el binario compilado desde el builder
COPY --from=builder /app/_build/prod/rel/my_vtt my_vtt

# Exponer puerto
EXPOSE 4000

# Comando de entrada
ENTRYPOINT ["./my_vtt/bin/my_vtt"]
CMD ["start"]
