#!/bin/bash

# Script de deploy rápido no Railway
# Certifique-se de ter o Railway CLI instalado: npm install -g @railway/cli

set -e

echo "🚂 Deploy da API Câmara Radar no Railway"
echo ""

# Verificar se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI não encontrado!"
    echo "   Instale com: npm install -g @railway/cli"
    exit 1
fi

# Verificar se está logado
echo "📝 Verificando autenticação..."
if ! railway whoami &> /dev/null; then
    echo "🔐 Fazendo login no Railway..."
    railway login
fi

# Perguntar se deve criar novo projeto ou usar existente
echo ""
read -p "Criar novo projeto Railway? (s/N): " criar_novo

if [[ $criar_novo =~ ^[Ss]$ ]]; then
    echo "📦 Criando novo projeto..."
    railway init
else
    echo "📦 Usando projeto existente..."
fi

# Deploy
echo ""
echo "🚀 Fazendo deploy..."
railway up

# Configurar variáveis de ambiente
echo ""
echo "⚙️  Configurar variáveis de ambiente"
echo ""
echo "Você precisa configurar as seguintes variáveis:"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_KEY"
echo "  - GEMINI_API_KEY"
echo "  - GEMINI_MODEL (opcional, padrão: gemini-2.0-flash-exp)"
echo ""
read -p "Configurar agora? (s/N): " config_vars

if [[ $config_vars =~ ^[Ss]$ ]]; then
    read -p "SUPABASE_URL: " supabase_url
    read -p "SUPABASE_KEY: " supabase_key
    read -p "GEMINI_API_KEY: " gemini_key
    
    railway variables set SUPABASE_URL="$supabase_url"
    railway variables set SUPABASE_KEY="$supabase_key"
    railway variables set GEMINI_API_KEY="$gemini_key"
    railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"
    
    echo "✅ Variáveis configuradas!"
fi

# Gerar domínio público
echo ""
echo "🌐 Gerando domínio público..."
railway domain

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Copie a URL do seu projeto"
echo "   2. Teste os endpoints:"
echo "      curl https://sua-url.up.railway.app/health"
echo "      curl https://sua-url.up.railway.app/api/ultimo-dia"
echo "   3. Atualize a Lambda da Alexa com a URL"
echo ""
echo "📊 Ver logs: railway logs"
echo ""

