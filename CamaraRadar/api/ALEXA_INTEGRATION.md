# Integração Completa - API + Alexa Skill

## Resumo da Arquitetura

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Alexa     │─────>│ AWS Lambda   │─────>│  API Flask   │─────>│  Supabase    │
│   Device    │      │ (Skill)      │      │ (Railway)    │      │  Database    │
└─────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                            │                      │
                            │                      v
                            │               ┌──────────────┐
                            │               │   Gemini AI  │
                            │               │   (Google)   │
                            │               └──────────────┘
                            │
                            v
                     ┌──────────────┐
                     │ Usuário      │
                     │ (Voz)        │
                     └──────────────┘
```

## Componentes

### 1. API Flask (Este Projeto)
**Localização**: `CamaraRadar/api/`
**Responsabilidade**: 
- Buscar dados do Supabase
- Consultar ordem do dia (ementas)
- Gerar resumos jornalísticos com Gemini
- Retornar texto formatado para Alexa

**Endpoints principais**:
- `/api/ultimo-dia` - Resumo do último dia com ementas (RECOMENDADO)
- `/api/resumo` - Resumo geral
- `/api/sessoes` - Sessões recentes

### 2. Lambda da Alexa Skill
**Localização**: `CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6/lambda/`
**Responsabilidade**:
- Receber comandos de voz do usuário
- Chamar API Flask
- Retornar resposta falada para Alexa

**Intents implementados**:
- `ConsultarResumoIntent` - "Me dê um resumo do dia"
- `ConsultarSessoesIntent` - "Quais sessões aconteceram"

### 3. Interaction Model
**Localização**: `CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6/skill-package/`
**Responsabilidade**:
- Definir frases que ativam cada intent
- Nome de invocação: "câmara radar"

## Fluxo Completo

1. **Usuário**: "Alexa, abrir Câmara Radar"
2. **Alexa**: Ativa a skill
3. **Usuário**: "Me dê um resumo do dia"
4. **Lambda**: Recebe intent `ConsultarResumoIntent`
5. **Lambda**: Faz requisição HTTP para `https://sua-api.com/api/ultimo-dia`
6. **API Flask**: 
   - Busca sessão mais recente do Supabase
   - Busca ordem do dia com ementas
   - Formata dados para Gemini
   - Gemini gera resumo jornalístico
   - Retorna JSON: `{"texto_alexa": "..."}`
7. **Lambda**: Extrai `texto_alexa`
8. **Alexa**: Fala o texto para o usuário

## Como Fazer Deploy Completo

### Passo 1: Deploy da API

```bash
cd CamaraRadar/api
./deploy-railway.sh
```

Anote a URL: `https://camara-radar-api-xxx.up.railway.app`

### Passo 2: Atualizar Lambda

Opção A - Via Código:

```python
# Em lambda_function.py, linha 17:
API_BASE_URL = "https://camara-radar-api-xxx.up.railway.app/api"
```

Opção B - Via Environment Variable (RECOMENDADO):

No AWS Lambda Console:
1. Selecione sua função
2. Configuration → Environment variables
3. Adicione: `API_BASE_URL` = `https://sua-url.up.railway.app/api`

### Passo 3: Deploy da Skill

```bash
cd CamaraRadar/amzn1askskill0ac1a010-a11e-468b-8e36-10265c59c4d6
ask deploy
```

### Passo 4: Testar

1. Teste a API diretamente:
```bash
curl https://sua-url.up.railway.app/api/ultimo-dia
```

2. Teste na Alexa:
- "Alexa, abrir Câmara Radar"
- "Me dê um resumo do dia"

## Melhorias Implementadas

### Antes
- Apenas dados básicos das sessões
- Sem informação sobre pautas
- Resumos vazios: "foram realizadas sessões"
- Tom às vezes bajulador

### Agora
- Busca ementas da ordem do dia
- Informa o que foi votado/discutido
- Resumos contextualizados e informativos
- Tom jornalístico imparcial
- Otimizado para speech (evita enumerações longas)

## Exemplo de Resposta

**Comando**: "Alexa, me dê um resumo do dia"

**Resposta**:
> "A Câmara Municipal de Campina Grande realizou, nesta terça-feira, dia 30 de dezembro, sua terceira sessão extraordinária. Os vereadores aprovaram o Orçamento do município para 2026, que estima as receitas e fixa as despesas. Também foi aprovado o Plano Plurianual para o período de 2026 a 2029. Outra matéria aprovada foi a alteração na redação de prioridades e metas da Lei de Diretrizes Orçamentárias para 2026. Os parlamentares ainda autorizaram a abertura de crédito adicional especial no orçamento da prefeitura para o exercício de 2025. Por outro lado, foi rejeitada a proposta que acrescentava novos dispositivos à Lei de Diretrizes Orçamentárias para 2026."

## Variáveis de Ambiente Necessárias

### Na API (Railway/Render):
```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxx...
GEMINI_API_KEY=AIzaxxx...
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Na Lambda (AWS):
```
API_BASE_URL=https://sua-api.up.railway.app/api
```

## Monitoramento

### Ver logs da API
```bash
railway logs
```

### Ver logs da Lambda
- AWS Console → CloudWatch → Log Groups
- Ou use: `ask dialog --locale pt-BR` para testar localmente

## Custos Mensais Estimados

- **Railway**: $0-10 (grátis até $5, depois ~$5-10)
- **AWS Lambda**: ~$0 (Alexa Skills são praticamente grátis)
- **Gemini API**: ~$0 (allowance gratuito é suficiente)
- **Supabase**: $0 (plano gratuito)

**Total**: Praticamente grátis ou ~$5-10/mês

## Suporte

Para problemas:
1. Verifique logs: `railway logs`
2. Teste API: `curl https://sua-url/health`
3. Verifique variáveis de ambiente
4. Veja logs da Lambda no CloudWatch

