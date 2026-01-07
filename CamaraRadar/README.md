# CâmaraRadar - Alexa Skill

Skill da Alexa para consultar informações sobre sessões e atividades da Câmara Municipal de Campina Grande.

## 🎯 Funcionalidades

- **Resumo Diário**: Receba um resumo em formato de notícia sobre o que aconteceu na Câmara
- **Consulta de Sessões**: Saiba quais sessões foram realizadas recentemente
- **Relatórios com IA**: Os resumos são gerados por LLM (GPT/Claude) a partir dos dados coletados

## 📋 Arquitetura

```
┌─────────────┐
│   Alexa     │
│   Device    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Lambda Handler │  (lambda_function.py)
│  Alexa Skill    │
└──────┬──────────┘
       │
       ▼ HTTP Request
┌─────────────────┐
│   API Server    │  (api/server.py)
│  Flask/Express  │
└──────┬──────────┘
       │
       ├──► Supabase (dados das sessões)
       │
       └──► LLM API (GPT/Claude) ──► Gera relatório em formato de notícia
```

## 🚀 Setup

### 1. Configurar API de Dados

A API precisa estar rodando e acessível pela Lambda. Você pode deployar:

- **AWS Lambda** (recomendado) usando Serverless Framework ou Zappa
- **AWS EC2** com Flask/Express
- **AWS ECS/Fargate**
- **Vercel/Netlify** (para APIs serverless)

#### Variáveis de Ambiente da API

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
LLM_API_KEY=your_openai_or_anthropic_key
LLM_API_URL=https://api.openai.com/v1/chat/completions
```

### 2. Configurar Lambda da Alexa Skill

No AWS Lambda, configure a variável de ambiente:

```
API_BASE_URL=https://sua-api.com/api
```

### 3. Deploy da Skill

```bash
cd amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6
ask deploy
```

## 📁 Estrutura do Projeto

```
CamaraRadar/
├── api/                          # API que fornece dados para Alexa
│   ├── alexa-endpoints.py       # Lógica de busca e geração de relatórios
│   ├── server.py                # Servidor Flask
│   └── requirements.txt         # Dependências Python
│
└── amzn1askskill.../            # Projeto da Skill
    ├── lambda/
    │   ├── lambda_function.py   # Handler da Alexa
    │   └── requirements.txt
    └── skill-package/
        ├── skill.json           # Manifest da skill
        └── interactionModels/
            └── custom/
                └── pt-BR.json   # Modelo de linguagem PT-BR
```

## 🔧 Desenvolvimento Local

### Testar API Localmente

```bash
cd api
pip install -r requirements.txt
python server.py
```

A API estará em `http://localhost:5000`

### Testar Skill Localmente

```bash
cd amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6
ask dialog
```

## 📝 Intents Disponíveis

### ConsultarResumoIntent
- **Exemplos**: "me dê um resumo do dia", "o que aconteceu hoje na câmara"
- **Ação**: Busca sessões do dia, gera relatório com LLM, retorna texto para Alexa

### ConsultarSessoesIntent
- **Exemplos**: "quais sessões aconteceram hoje", "me fale sobre as sessões"
- **Ação**: Lista sessões recentes com resumo gerado por LLM

## 🤖 Integração com LLM

O sistema usa LLM para transformar dados brutos em relatórios em formato de notícia:

1. **Busca dados** do Supabase (sessões, datas, tipos)
2. **Formata dados** em texto estruturado
3. **Envia para LLM** com prompt jornalístico
4. **Recebe texto** formatado para fala
5. **Alexa fala** o relatório gerado

### LLMs Suportados

- OpenAI GPT-3.5/GPT-4
- Anthropic Claude
- Qualquer API compatível com formato OpenAI

### Customizar Prompts

Edite `api/alexa-endpoints.py` na função `generate_news_report()` para ajustar o estilo dos relatórios.

## 🔐 Segurança

- Use variáveis de ambiente para credenciais
- Configure CORS adequadamente na API
- Use HTTPS para todas as comunicações
- Configure rate limiting na API

## 📚 Próximos Passos

- [ ] Adicionar mais intents (consultar vereadores, projetos, etc.)
- [ ] Implementar cache para reduzir chamadas ao LLM
- [ ] Adicionar suporte a notificações proativas
- [ ] Melhorar tratamento de erros
- [ ] Adicionar testes automatizados

## 📄 Licença

MIT

