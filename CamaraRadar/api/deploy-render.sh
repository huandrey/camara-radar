#!/bin/bash

# Deploy no Render.com (100% Grátis)
# Sem necessidade de CLI, tudo via interface web

cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║           Deploy no Render.com (100% GRÁTIS)                  ║
╚═══════════════════════════════════════════════════════════════╝

📋 PASSO A PASSO:

1️⃣  Criar conta no Render
   → Acesse: https://render.com/
   → Conecte com GitHub (recomendado)

2️⃣  Criar Web Service
   → Clique em "New +" → "Web Service"
   → Conecte seu repositório GitHub
   → Ou cole a URL do repositório público

3️⃣  Configurar o serviço
   
   Nome: camara-radar-api
   
   Branch: main (ou sua branch)
   
   Root Directory: CamaraRadar/api
   
   Runtime: Python 3
   
   Build Command: 
   pip install -r requirements.txt
   
   Start Command:
   gunicorn server:app --bind 0.0.0.0:$PORT --timeout 120
   
   Plan: Free (0$/mês)

4️⃣  Adicionar variáveis de ambiente
   
   Clique em "Advanced" → "Add Environment Variable"
   
   Adicione:
   - SUPABASE_URL = sua_url_supabase
   - SUPABASE_KEY = sua_key_supabase
   - GEMINI_API_KEY = sua_key_gemini
   - GEMINI_MODEL = gemini-2.0-flash-exp

5️⃣  Deploy!
   → Clique em "Create Web Service"
   → Aguarde o build (2-3 minutos)
   → Sua URL será: https://camara-radar-api.onrender.com

6️⃣  Testar
   curl https://camara-radar-api.onrender.com/health
   curl https://camara-radar-api.onrender.com/api/ultimo-dia

📌 IMPORTANTE:
   - Plano gratuito: App "dorme" após 15min sem uso
   - Primeira requisição após sleep: ~30 segundos
   - Para manter sempre ativo: upgrade para plano pago ($7/mês)

✅ VANTAGENS:
   ✓ 100% gratuito (com limitações)
   ✓ Fácil de usar (interface visual)
   ✓ Auto-deploy quando faz push no GitHub
   ✓ SSL/HTTPS automático
   ✓ Logs em tempo real

❌ DESVANTAGENS:
   ✗ App dorme após inatividade
   ✗ Build pode ser lento no plano free
   ✗ Região: apenas US/Europa

🔗 LINKS ÚTEIS:
   Dashboard: https://dashboard.render.com/
   Docs: https://render.com/docs

EOF

