# Pipelines de Coleta de Dados

Este diretório contém os pipelines modulares de coleta de dados do sistema.

## Arquitetura

Cada pipeline é independente e segue a mesma estrutura:

- `{pipeline}.pipeline.ts` - Orquestração principal
- `{pipeline}.fetcher.ts` - Requisições HTTP
- `{pipeline}.parser.ts` - Parsing HTML
- `{pipeline}.normalizer.ts` - Normalização de dados
- `{pipeline}.repository.ts` - Operações no banco
- `{pipeline}.types.ts` - Tipos TypeScript
- `{pipeline}.metrics.ts` - Métricas específicas

## Pipeline de Sessões

O pipeline de sessões é responsável por coletar informações básicas das sessões legislativas.

### Dependências

- Nenhuma (é o pipeline base)

### Output

- Tabela `sessions` no Supabase
- Campo `detalhes_coletados` inicializado como `NAO_COLETADO`

### Contratos de Dados

O pipeline de sessões cria registros na tabela `sessions` com:
- `id` (PRIMARY KEY) - ID da sessão
- `detalhes_coletados` - Status de coleta de detalhes (`NAO_COLETADO`, `PROCESSANDO`, `COLETADO`, `ERRO`)

## Pipelines Futuros

### Pipeline de Ementas (EmentaCollector)

**Status**: Planejado

**Dependências**:
- `sessions.id` (foreign key)

**Responsabilidades**:
- Coletar lista de ementas de uma sessão
- Salvar título, autor, status básico
- Marcar sessão como `detalhes_coletados = PROCESSANDO` → `COLETADO`

**Input**: `sessions.id`

**Output**: Tabela `ementas` no Supabase

### Pipeline de Tramitação (TramitacaoCollector)

**Status**: Planejado

**Dependências**:
- `ementas.id` (foreign key)

**Responsabilidades**:
- Coletar tramitações de uma ementa
- Navegar na aba específica
- Normalizar etapas de tramitação

**Input**: `ementas.id`

**Output**: Tabela `tramitacoes` no Supabase

### Pipeline de Detalhes (DetalheCollector)

**Status**: Planejado

**Dependências**:
- `ementas.id` (foreign key)

**Responsabilidades**:
- Coletar texto completo da ementa
- Descrição detalhada
- Dados complementares

**Input**: `ementas.id`

**Output**: Atualização na tabela `ementas` com detalhes completos

## Ordem de Execução Recomendada

1. **Sessions Pipeline** (base) - Executa via CRON
2. **Ementas Pipeline** - Executa para sessões com `detalhes_coletados = NAO_COLETADO`
3. **Tramitação Pipeline** - Executa para ementas sem tramitações coletadas
4. **Detalhes Pipeline** - Executa para ementas sem detalhes completos

## Comunicação Entre Pipelines

Os pipelines não se conhecem diretamente. A comunicação é feita via:

- **Banco de Dados (Supabase)**: Campos de status e foreign keys
- **Sistema de Eventos**: Eventos emitidos durante execução
- **On-Demand API**: Chamadas programáticas quando necessário

## Roadmap

- [x] Pipeline de Sessões
- [ ] Pipeline de Ementas
- [ ] Pipeline de Tramitação
- [ ] Pipeline de Detalhes
- [ ] Orquestrador geral de pipelines
- [ ] API HTTP para expor endpoints on-demand


