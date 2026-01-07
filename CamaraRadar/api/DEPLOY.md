# Deploy da API para Alexa Skill

Este guia mostra como fazer deploy da API para que a Alexa possa acessá-la.

## Opção 1: Deploy no Railway (Recomendado - Mais Rápido)

### Passo 1: Criar conta no Railway

1. Acesse https://railway.app/
2. Crie uma conta (pode usar GitHub)
3. Você tem $5 de crédito grátis por mês

### Passo 2: Deploy via CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Na pasta da API
cd CamaraRadar/api

# Criar novo projeto
railway init

# Fazer deploy
railway up

# Adicionar variáveis de ambiente
railway variables set SUPABASE_URL="sua_url_aqui"
railway variables set SUPABASE_KEY="sua_key_aqui"
railway variables set GEMINI_API_KEY="sua_key_aqui"
railway variables set GEMINI_MODEL="gemini-2.0-flash-exp"

# Gerar domínio público
railway domain
```

### Passo 3: Obter URL da API

Após o deploy, você terá uma URL como:
```
https://seu-projeto.up.railway.app
```

Seus endpoints serão:
- `https://seu-projeto.up.railway.app/api/resumo`
- `https://seu-projeto.up.railway.app/api/ultimo-dia`
- `https://seu-projeto.up.railway.app/api/sessoes`

## Opção 2: Deploy no Render

### Passo 1: Criar conta

1. Acesse https://render.com/
2. Crie uma conta
3. Plano gratuito disponível

### Passo 2: Deploy via Dashboard

1. Clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn server:app`
   - **Environment**: Python 3
4. Adicione variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
5. Deploy!

### Passo 3: Obter URL

Sua URL será algo como:
```
https://camara-radar-api.onrender.com
```

## Opção 3: Deploy no Fly.io

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Na pasta da API
cd CamaraRadar/api

# Criar app
fly launch

# Configurar variáveis
fly secrets set SUPABASE_URL="sua_url"
fly secrets set SUPABASE_KEY="sua_key"
fly secrets set GEMINI_API_KEY="sua_key"
fly secrets set GEMINI_MODEL="gemini-2.0-flash-exp"

# Deploy
fly deploy
```

## Opção 4: AWS Lambda (Integração Nativa com Alexa)

### Usando Zappa

```bash
# Instalar Zappa
pip install zappa

# Inicializar
zappa init

# Deploy
zappa deploy production

# Atualizar
zappa update production

# Ver logs
zappa tail production
```

## Configurar Alexa Skill

Após fazer deploy da API, você precisa atualizar a Lambda da Alexa:

### Passo 1: Atualizar URL da API

No arquivo `CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6/lambda/lambda_function.py`:

```python
API_BASE_URL = os.environ.get("API_BASE_URL", "https://sua-api-deployada.com/api")
```

### Passo 2: Fazer deploy da Lambda

```bash
cd CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6

# Instalar ASK CLI se ainda não tiver
npm install -g ask-cli

# Configurar credenciais AWS
ask configure

# Deploy da skill
ask deploy
```

### Passo 3: Configurar variável de ambiente na Lambda

No AWS Console:
1. Vá em Lambda Functions
2. Selecione sua função da Alexa
3. Configuration → Environment variables
4. Adicione: `API_BASE_URL` = `https://sua-api-deployada.com/api`

## Testar

### 1. Testar API diretamente

```bash
curl https://sua-api-deployada.com/health
curl https://sua-api-deployada.com/api/ultimo-dia
```

### 2. Testar na Alexa

Diga para a Alexa:
- "Alexa, abrir Câmara Radar"
- "Me dê um resumo do dia"
- "O que aconteceu hoje na câmara"

## Monitoramento

### Railway
```bash
railway logs
```

### Render
- Logs disponíveis no dashboard

### Fly.io
```bash
fly logs
```

## Troubleshooting

### Erro de timeout
- Aumentar timeout no gunicorn (já está em 120s)
- Verificar se Gemini API está respondendo

### Erro 500
- Verificar logs: `railway logs` ou no dashboard
- Verificar se variáveis de ambiente estão configuradas
- Testar endpoints localmente primeiro

### Alexa não responde
- Verificar se URL da API está correta na Lambda
- Verificar logs da Lambda no AWS CloudWatch
- Testar API diretamente com curl

## Custos Estimados

- **Railway**: $5/mês grátis, depois ~$5-10/mês
- **Render**: Grátis (com limitações), depois $7/mês
- **Fly.io**: Grátis (allowance), depois ~$5/mês
- **AWS Lambda**: Praticamente grátis para Alexa Skills

## Recomendação

Para testar: **Railway** (mais rápido)
Para produção: **AWS Lambda** (melhor integração com Alexa)

