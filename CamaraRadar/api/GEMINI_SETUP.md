# Como usar Gemini (Google) em vez de OpenAI

## 1. Obter API Key do Gemini

1. Acesse: https://makersuite.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave (começa com `AIza...`)

## 2. Configurar no .env

Edite o arquivo `.env` na raiz do projeto:

```bash
# Use Gemini em vez de OpenAI
LLM_API_KEY=AIzaSua-Chave-Aqui
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
```

## 3. Restart o servidor

```bash
cd CamaraRadar/api
python server.py
```

Pronto! O sistema vai detectar automaticamente que é Gemini pela URL e usar o formato correto.

## Vantagens do Gemini

- ✅ Gratuito até 60 requisições por minuto
- ✅ Boa qualidade de texto
- ✅ Mais barato que OpenAI para uso pago

