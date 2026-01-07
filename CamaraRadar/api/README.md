# API para Alexa Skill - CâmaraRadar

API que fornece dados formatados em texto para a Alexa Skill falar.

## Funcionalidades

1. **Busca dados do Supabase** sobre sessões da Câmara
2. **Gera relatórios com LLM** em formato de notícia radiofônica
3. **Retorna texto formatado** para a Alexa falar

## Endpoints

### GET /api/resumo
Retorna resumo do dia formatado para Alexa.

**Resposta:**
```json
{
  "texto_alexa": "Hoje na Câmara Municipal de Campina Grande...",
  "sessions_count": 3
}
```

### GET /api/sessoes
Retorna resumo de sessões recentes.

**Resposta:**
```json
{
  "texto_alexa": "Nas últimas sessões realizadas...",
  "sessions_count": 5
}
```

## Setup

1. Instale dependências:
```bash
pip install -r requirements.txt
```

2. Configure variáveis de ambiente:
```bash
export SUPABASE_URL=your_url
export SUPABASE_KEY=your_key
export LLM_API_KEY=your_llm_key
export LLM_API_URL=https://api.openai.com/v1/chat/completions
```

3. Execute:
```bash
python server.py
```

## Deploy

### AWS Lambda (Recomendado)

Use [Zappa](https://github.com/Miserlou/Zappa) ou [Serverless Framework](https://www.serverless.com/):

```bash
# Com Zappa
zappa init
zappa deploy production

# Com Serverless
serverless deploy
```

### Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "server.py"]
```

## Variáveis de Ambiente

- `SUPABASE_URL`: URL do projeto Supabase
- `SUPABASE_KEY`: Chave anônima do Supabase
- `LLM_API_KEY`: Chave da API do LLM (OpenAI, Anthropic, etc.)
- `LLM_API_URL`: URL da API do LLM

