# Setup do Supabase

Este guia explica como configurar o Supabase para o projeto funcionar corretamente.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Anote a **URL** e a **anon key** do projeto

## 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o `.env` e preencha:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-anon-key-aqui
NODE_ENV=development
LOG_LEVEL=info
```

## 3. Executar Migration SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `src/shared/supabase/migrations/001_create_sessions_table.sql`
4. Clique em **Run** ou pressione `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux)

### O que a migration cria:

- **Enum `detail_status`**: Define os status possíveis (`NAO_COLETADO`, `PROCESSANDO`, `COLETADO`, `ERRO`)
- **Tabela `sessions`**: Armazena as sessões legislativas
- **Índices**: Para otimizar consultas por data e status

## 4. Verificar Permissões RLS (Row Level Security)

Por padrão, o Supabase pode ter RLS habilitado. Para este projeto funcionar:

1. Vá em **Authentication** > **Policies**
2. Na tabela `sessions`, verifique se há políticas RLS
3. Se necessário, crie uma política que permita inserção/atualização:

```sql
-- Permitir inserção/atualização para usuários autenticados
-- Ou desabilitar RLS temporariamente para testes (não recomendado para produção)

-- Para desenvolvimento/testes, você pode desabilitar RLS:
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
```

**⚠️ ATENÇÃO**: Desabilitar RLS é apenas para desenvolvimento. Em produção, configure políticas adequadas.

## 5. Testar Conexão

Execute o script de teste:

```bash
pnpm tsx scripts/test-supabase-connection.ts
```

Este script vai:
- ✅ Verificar se a tabela existe
- ✅ Testar inserção de dados
- ✅ Testar upsert (onConflict)
- ✅ Verificar contagem de registros

## 6. Testar Pipeline Completo

Depois que a conexão estiver OK, teste o pipeline:

```bash
pnpm tsx scripts/test-pipeline-manual.ts
```

Este script vai:
- Executar o pipeline em modo `daily` (apenas 1 página)
- Mostrar métricas de execução
- Inserir sessões reais no banco

## Troubleshooting

### Erro: "relation 'sessions' does not exist"

**Solução**: Execute a migration SQL no Supabase SQL Editor.

### Erro: "permission denied for table sessions"

**Solução**: Verifique as políticas RLS ou desabilite temporariamente para testes.

### Erro: "type 'detail_status' does not exist"

**Solução**: Certifique-se de executar a migration completa, incluindo a criação do enum.

### Erro: "invalid input value for enum detail_status"

**Solução**: Verifique se o enum foi criado corretamente com os valores:
- `NAO_COLETADO`
- `PROCESSANDO`
- `COLETADO`
- `ERRO`

## Verificar Dados no Supabase

1. No dashboard do Supabase, vá em **Table Editor**
2. Selecione a tabela `sessions`
3. Você verá os dados inseridos pelo pipeline

## Próximos Passos

Depois que tudo estiver funcionando:

1. Configure os CRON jobs para execução automática
2. Monitore os logs para verificar se está coletando dados corretamente
3. Ajuste os seletores HTML no parser se necessário (conforme estrutura real do site)


