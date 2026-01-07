# 🧪 Guia de Testes - API Alexa Endpoints

## ⚠️ IMPORTANTE

**O GPT/LLM NÃO funciona sem API key!** 

Mas o sistema tem um **modo fallback** que funciona sem LLM, gerando texto formatado diretamente dos dados.

## 📋 Pré-requisitos

1. **Supabase configurado** (obrigatório para buscar dados reais)
2. **LLM API key** (opcional - sistema funciona sem ela usando fallback)

## 🚀 Como Testar

### Passo 1: Configurar Variáveis de Ambiente

```bash
# OBRIGATÓRIO: Credenciais do Supabase
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_KEY="sua-chave-anon"

# OPCIONAL: LLM (se não configurar, usa fallback)
export LLM_API_KEY="sk-..."  # OpenAI ou Anthropic
export LLM_API_URL="https://api.openai.com/v1/chat/completions"
```

### Passo 2: Testar Funções Diretamente (sem servidor)

**O que este comando faz:** Executa testes unitários das funções sem precisar iniciar o servidor Flask. Testa formatação de dados e geração de texto.

```bash
cd api
python test_endpoints.py
```

**O que você verá:**
- ✅ Teste com dados mockados (não precisa de Supabase)
- ✅ Teste sem LLM (modo fallback)
- ✅ Informações sobre configuração

### Passo 3: Iniciar Servidor Flask Localmente

**O que este comando faz:** Inicia o servidor Flask na porta 5000, permitindo testar os endpoints HTTP que a Alexa vai usar.

```bash
cd api
python server.py
```

**O que você verá:**
```
 * Running on http://127.0.0.1:5000
```

### Passo 4: Testar Endpoints HTTP

**Em outro terminal**, execute os testes:

#### Teste 1: Health Check

**O que este comando faz:** Verifica se o servidor está respondendo corretamente.

```bash
curl http://localhost:5000/health
```

**Resposta esperada:**
```json
{"status": "ok"}
```

#### Teste 2: Resumo do Dia (sem LLM)

**O que este comando faz:** Busca sessões do Supabase e retorna texto formatado usando fallback (sem LLM). O parâmetro `use_llm=false` força o modo sem LLM.

```bash
curl "http://localhost:5000/api/resumo?use_llm=false"
```

**Resposta esperada:**
```json
{
  "texto_alexa": "Hoje na Câmara Municipal de Campina Grande, foram realizadas 2 sessões...",
  "sessions_count": 2,
  "llm_used": false
}
```

#### Teste 3: Resumo do Dia (com LLM - se configurado)

**O que este comando faz:** Se você tiver LLM_API_KEY configurado, tenta gerar relatório usando LLM. Se não tiver, usa fallback automaticamente.

```bash
curl http://localhost:5000/api/resumo
```

#### Teste 4: Sessões Recentes

**O que este comando faz:** Busca sessões dos últimos 3 dias e retorna resumo formatado.

```bash
curl "http://localhost:5000/api/sessoes?use_llm=false"
```

### Passo 5: Usar Script de Teste Automatizado

**O que este script faz:** Executa todos os testes HTTP automaticamente usando curl e formata as respostas JSON.

```bash
cd api
./test_curl.sh
```

Ou especifique uma URL diferente:
```bash
./test_curl.sh http://localhost:5000
```

## 🔍 Verificando se Funciona

### ✅ Teste Bem-Sucedido

Você deve ver:
- Status 200 nas respostas
- Campo `texto_alexa` com texto formatado
- Campo `sessions_count` com número de sessões
- Campo `llm_used` indicando se LLM foi usado

### ❌ Problemas Comuns

#### Erro: "Supabase credentials not configured"
**Solução:** Configure `SUPABASE_URL` e `SUPABASE_KEY`

#### Erro: "Connection refused"
**Solução:** Certifique-se de que o servidor está rodando (`python server.py`)

#### Erro: "No sessions found"
**Solução:** Verifique se há dados no Supabase. O sistema busca sessões do dia atual ou últimas 24h.

#### Texto muito técnico/bruto
**Solução:** Configure `LLM_API_KEY` para usar LLM e gerar textos mais naturais.

## 📊 Comparação: Com vs Sem LLM

### Sem LLM (Fallback)
```
"Hoje na Câmara Municipal de Campina Grande, foram realizadas 2 sessões. 
sessão ORDINÁRIA - 119ª Sessão Ordinária realizada em 06 de janeiro de 2025..."
```

### Com LLM
```
"Na sessão de hoje da Câmara Municipal de Campina Grande, foram realizadas 
duas importantes reuniões. A primeira foi a 119ª Sessão Ordinária, que 
marcou o início dos trabalhos legislativos desta semana..."
```

## 🎯 Próximos Passos Após Testes

1. ✅ Testes locais passando
2. ✅ Verificar formato do texto para Alexa
3. ✅ Deploy da API (AWS Lambda, EC2, etc.)
4. ✅ Configurar Lambda da Alexa Skill com URL da API
5. ✅ Testar skill completa na Alexa

## 🐛 Debug

Para ver logs detalhados:

```bash
# No servidor Flask, os logs aparecem no console
# Para mais detalhes, configure:
export FLASK_ENV=development
python server.py
```

Para testar com dados mockados (sem Supabase):

```python
# Edite test_endpoints.py e use test_with_mock_data()
```

