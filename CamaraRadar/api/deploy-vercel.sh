#!/bin/bash

# Deploy no Vercel
# Ótimo para serverless, mas precisa adaptar para Flask

cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║              Deploy no Vercel (Serverless)                    ║
╚═══════════════════════════════════════════════════════════════╝

⚠️  IMPORTANTE: Flask no Vercel requer adaptação para serverless

📋 PASSO A PASSO:

1️⃣  Instalar Vercel CLI
   npm install -g vercel

2️⃣  Login
   vercel login

3️⃣  Criar arquivo vercel.json na pasta api/

{
  "version": 2,
  "builds": [
    {
      "src": "server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.py"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_KEY": "@supabase-key",
    "GEMINI_API_KEY": "@gemini-api-key",
    "GEMINI_MODEL": "gemini-2.0-flash-exp"
  }
}

4️⃣  Adaptar server.py para serverless
   # Adicionar no final do server.py:
   from werkzeug.middleware.proxy_fix import ProxyFix
   app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
   
   # Para Vercel:
   # O handler precisa ser 'app' não 'app.run()'

5️⃣  Deploy
   cd CamaraRadar/api
   vercel

6️⃣  Configurar secrets
   vercel secrets add supabase-url "sua_url"
   vercel secrets add supabase-key "sua_key"
   vercel secrets add gemini-api-key "sua_key"

7️⃣  Deploy production
   vercel --prod

✅ VANTAGENS:
   ✓ Gratuito (limites generosos)
   ✓ Edge network global
   ✓ Sem cold start (serverless otimizado)
   ✓ Auto-scaling

❌ DESVANTAGENS:
   ✗ Complexidade (precisa adaptar Flask)
   ✗ Timeout de 10s (hobby) ou 60s (pro)
   ✗ Não ideal para long-running requests

💡 RECOMENDAÇÃO:
   Use Vercel se já está familiarizado com serverless
   Caso contrário, prefira Fly.io ou Render

EOF

echo ""
read -p "Deseja continuar com Vercel? (s/N): " continuar

if [[ ! $continuar =~ ^[Ss]$ ]]; then
    echo "Abortado. Considere usar Fly.io ou Render para setup mais simples."
    exit 0
fi

# Instalar Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "Instalando Vercel CLI..."
    npm install -g vercel
fi

# Criar vercel.json
cat > vercel.json << 'VERCELJSON'
{
  "version": 2,
  "builds": [
    {
      "src": "server.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.py"
    }
  ]
}
VERCELJSON

echo "✅ vercel.json criado!"
echo ""
echo "Execute: vercel"

