#!/bin/bash

# Deploy no Fly.io
# Plano gratuito generoso + pode escolher região Brasil

set -e

echo "🪂 Deploy da API Câmara Radar no Fly.io"
echo ""

# Verificar se Fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI não encontrado!"
    echo ""
    echo "📥 Instalando Fly CLI..."
    
    # Detecta o OS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -L https://fly.io/install.sh | sh
        echo 'export FLYCTL_INSTALL="$HOME/.fly"' >> ~/.zshrc
        echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> ~/.zshrc
        export FLYCTL_INSTALL="$HOME/.fly"
        export PATH="$FLYCTL_INSTALL/bin:$PATH"
    else
        # Linux
        curl -L https://fly.io/install.sh | sh
    fi
    
    echo ""
    echo "✅ Fly CLI instalado!"
    echo "   Execute: source ~/.zshrc"
    echo "   Depois rode este script novamente"
    exit 0
fi

# Login
echo "🔐 Fazendo login no Fly.io..."
if ! fly auth whoami &> /dev/null; then
    fly auth login
fi

# Criar fly.toml se não existir
if [ ! -f "fly.toml" ]; then
    echo "📝 Criando configuração fly.toml..."
    
    cat > fly.toml << 'FLYTOML'
app = "camara-radar-api"
primary_region = "gru" # São Paulo, Brasil

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"
  GEMINI_MODEL = "gemini-2.0-flash-exp"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
FLYTOML

    echo "✅ fly.toml criado!"
fi

# Launch app
echo ""
echo "🚀 Criando app no Fly.io..."
if fly apps list | grep -q "camara-radar-api"; then
    echo "App já existe, fazendo deploy..."
else
    fly launch --no-deploy
fi

# Configurar variáveis de ambiente
echo ""
echo "⚙️  Configurar variáveis de ambiente (secrets)"
echo ""
read -p "SUPABASE_URL: " supabase_url
read -sp "SUPABASE_KEY: " supabase_key
echo ""
read -sp "GEMINI_API_KEY: " gemini_key
echo ""

fly secrets set \
    SUPABASE_URL="$supabase_url" \
    SUPABASE_KEY="$supabase_key" \
    GEMINI_API_KEY="$gemini_key"

# Deploy
echo ""
echo "🚀 Fazendo deploy..."
fly deploy

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Informações:"
fly info

echo ""
echo "🌐 Sua URL: https://camara-radar-api.fly.dev"
echo ""
echo "📊 Comandos úteis:"
echo "   Ver status: fly status"
echo "   Ver logs: fly logs"
echo "   Abrir dashboard: fly dashboard"
echo "   Escalar máquinas: fly scale count 1"
echo ""
echo "💡 Plano gratuito:"
echo "   - Apps dormem após inatividade"
echo "   - Acordam automaticamente em ~1s"
echo "   - Allowance: 160GB-hours/mês (suficiente!)"
echo ""

