# ADR 001: Arquitetura Modular de Pipelines

**Status**: Aprovado

**Data**: 2026-01-07

**Contexto**: O sistema Câmara Radar precisa coletar dados de múltiplas fontes da Câmara Municipal de Campina Grande. Os dados são interdependentes e precisam ser coletados de forma incremental.

**Decisão**: Implementar uma arquitetura modular de pipelines independentes que se comunicam através do banco de dados (Supabase).

## Estrutura dos Pipelines

Cada pipeline segue a mesma estrutura:
- `{pipeline}.pipeline.ts` - Orquestração principal
- `{pipeline}.fetcher.ts` - Requisições HTTP
- `{pipeline}.parser.ts` - Parsing HTML
- `{pipeline}.normalizer.ts` - Normalização de dados
- `{pipeline}.repository.ts` - Operações no banco
- `{pipeline}.types.ts` - Tipos TypeScript
- `{pipeline}.metrics.ts` - Métricas específicas

## Pipelines Implementados

### 1. Sessions Pipeline (Base)
- Coleta informações básicas das sessões legislativas
- Status: Implementado
- Tabela: `sessions`
- Campos coletados:
  - ID da sessão
  - Título
  - Tipo (Ordinária, Extraordinária, Solene, Especial)
  - Data de abertura
  - Legislatura
  - Sessão legislativa
  - URL
  - Detalhes (número, horários, URLs de mídia)

### 2. Order of Day Pipeline
- Coleta a ordem do dia (pauta) de cada sessão
- Status: Implementado
- Tabela: `session_order_of_day`
- Campos coletados:
  - Número da ordem
  - Conteúdo/descrição
  - Ementa (texto completo da matéria)
  - Situação (status atual)
  - Observação
  - Resultado
  - ID da matéria

### 3. Attendance Pipeline
- Coleta a lista de presença dos vereadores
- Status: Implementado
- Tabela: `session_attendance`
- Campos coletados:
  - ID do parlamentar
  - Nome do parlamentar
  - Presença (boolean)

## Comunicação Entre Pipelines

Os pipelines não se conhecem diretamente. A comunicação é feita via:
- **Banco de Dados**: Campos de status (`detalhes_coletados`) e foreign keys
- **Sistema de Eventos**: Eventos emitidos durante execução
- **On-Demand API**: Chamadas programáticas quando necessário

## Consequências

**Positivas**:
- Baixo acoplamento entre componentes
- Fácil de testar cada pipeline isoladamente
- Pode executar pipelines em paralelo
- Fácil adicionar novos pipelines

**Negativas**:
- Necessário gerenciar estados no banco de dados
- Complexidade na orquestração de múltiplos pipelines

