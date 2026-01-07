# 🚀 Quick Start - Testando Antes do Deploy

## ⚠️ Respostas às Suas Perguntas

### 1. "O GPT vai funcionar sem API key?"
**NÃO!** Mas o sistema tem um **modo fallback** que funciona perfeitamente sem LLM, gerando texto formatado diretamente dos dados do Supabase.

### 2. "Não podemos deployar sem testar"
**Correto!** Por isso criamos scripts de teste completos. Siga os passos abaixo.

## 📝 O Que Foi Criado

1. ✅ **API com fallback** - Funciona sem LLM
2. ✅ **Scripts de teste** - `test_endpoints.py` e `test_curl.sh`
3. ✅ **Modo de teste** - Parâmetro `use_llm=false` nos endpoints
4. ✅ **Documentação completa** - `TESTING.md` com guia passo a passo

## 🧪 Como Testar (Passo a Passo)

### 1. Configure Variáveis de Ambiente

**O que este comando faz:** Define as credenciais do Supabase que serão usadas para buscar dados reais das sessões.

```bash
export SUPABASE_URL="https://seu-projeto.supabase.co"
export SUPABASE_KEY="sua-chave-anon"
```

**Nota:** LLM_API_KEY é opcional - o sistema funciona sem ela!

### 2. Teste as Funções (Sem Servidor)

**O que este comando faz:** Executa testes unitários que verificam se as funções de formatação e busca de dados estão funcionando corretamente, sem precisar iniciar o servidor web.

```bash
cd CamaraRadar/api
python test_endpoints.py
```

**O que você verá:**
- Teste com dados mockados (não precisa de Supabase)
- Teste real buscando do Supabase (precisa das variáveis configuradas)
- Informações sobre se LLM está disponível ou não

### 3. Inicie o Servidor Flask

**O que este comando faz:** Inicia um servidor web local na porta 5000 que expõe os endpoints HTTP que a Alexa Skill vai usar para buscar dados.

```bash
python server.py
```

**O que você verá:**
```
 * Running on http://127.0.0.1:5000
 * Press CTRL+C to quit
```

### 4. Teste os Endpoints HTTP

**Em outro terminal**, execute:

#### Teste Health Check

**O que este comando faz:** Verifica se o servidor está respondendo e funcionando corretamente.

```bash
curl http://localhost:5000/health
```

#### Teste Resumo (SEM LLM - Modo Fallback)

**O que este comando faz:** Busca sessões do Supabase e retorna texto formatado usando o modo fallback (sem LLM). O parâmetro `use_llm=false` força o sistema a não tentar usar LLM.

```bash
curl "http://localhost:5000/api/resumo?use_llm=false"
```

**Resposta esperada:**
```json
{
  "texto_alexa": "Hoje na Câmara Municipal de Campina Grande...",
  "sessions_count": 2,
  "llm_used": false
}
```

#### Teste com Script Automatizado

**O que este script faz:** Executa todos os testes HTTP automaticamente, fazendo requisições para todos os endpoints e formatando as respostas JSON de forma legível.

```bash
./test_curl.sh
```

## ✅ Checklist Antes do Deploy

- [ ] Testes unitários passando (`python test_endpoints.py`)
- [ ] Servidor Flask iniciando sem erros
- [ ] Endpoint `/health` retornando `{"status": "ok"}`
- [ ] Endpoint `/api/resumo` retornando texto formatado
- [ ] Campo `llm_used` indicando corretamente se LLM foi usado
- [ ] Texto em `texto_alexa` está adequado para Alexa falar

## 🎯 Próximos Passos

1. **Testar localmente** ✅ (você está aqui)
2. **Deploy da API** (AWS Lambda, EC2, etc.)
3. **Configurar Lambda da Alexa** com URL da API deployada
4. **Testar skill completa** na Alexa

## 📚 Documentação Completa

Veja `api/TESTING.md` para guia detalhado de testes e troubleshooting.

