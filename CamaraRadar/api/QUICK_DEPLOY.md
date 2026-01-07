# Deploy Rápido - 5 Minutos

## Opção Mais Rápida: Railway

### 1. Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Fazer Deploy

```bash
cd CamaraRadar/api
./deploy-railway.sh
```

O script vai:
- Fazer login no Railway
- Criar projeto
- Fazer deploy
- Configurar variáveis de ambiente
- Gerar URL pública

### 3. Copiar URL

Após o deploy, copie a URL gerada (algo como `https://camara-radar-api-xxx.up.railway.app`)

### 4. Atualizar Lambda da Alexa

Edite `CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6/lambda/lambda_function.py`:

```python
API_BASE_URL = os.environ.get("API_BASE_URL", "https://SUA-URL-RAILWAY.up.railway.app/api")
```

### 5. Deploy da Skill

```bash
cd CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6
ask deploy
```

Ou configure a variável de ambiente no AWS Lambda Console:
- Vá em Lambda → Sua função
- Configuration → Environment variables
- Adicione: `API_BASE_URL` = `https://sua-url.up.railway.app/api`

### 6. Testar!

Diga para a Alexa:
- "Alexa, abrir Câmara Radar"
- "Me dê um resumo do dia"

## Troubleshooting

### Ver logs
```bash
railway logs
```

### Testar API diretamente
```bash
curl https://sua-url.up.railway.app/health
curl https://sua-url.up.railway.app/api/ultimo-dia | jq
```

### Redeploy após mudanças
```bash
railway up
```

## Custos

- **Grátis**: $5 de crédito por mês
- **Pago**: ~$5-10/mês se exceder

## Alternativa: Render (100% Grátis)

Se quiser 100% grátis (com algumas limitações):

1. Acesse https://render.com/
2. Conecte seu repositório GitHub
3. Crie um "Web Service"
4. Configure:
   - Build: `pip install -r requirements.txt`
   - Start: `gunicorn server:app`
5. Adicione variáveis de ambiente
6. Deploy!

**Limitações**: Pode "dormir" após 15 min de inatividade (primeira requisição demora mais)

