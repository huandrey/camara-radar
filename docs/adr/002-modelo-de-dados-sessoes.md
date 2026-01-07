# ADR 002: Modelo de Dados de Sessões

**Status**: Aprovado

**Data**: 2026-01-07

**Contexto**: Precisamos armazenar informações completas sobre sessões legislativas, incluindo dados básicos, detalhes, ordem do dia e presença.

**Decisão**: Utilizar modelo relacional com 3 tabelas principais interconectadas.

## Tabelas

### sessions
Armazena informações básicas e detalhadas de cada sessão.

**Campos básicos** (sempre coletados):
- `id` (UUID) - Chave primária interna
- `session_id` (INTEGER) - ID externo da Câmara (UNIQUE)
- `title` (TEXT) - Título da sessão
- `type` (TEXT) - Tipo: "Ordinária", "Extraordinária", "Solene", "Especial"
- `opening_date` (TIMESTAMP) - Data de abertura
- `legislature` (TEXT) - Legislatura
- `legislative_session` (TEXT) - Sessão legislativa
- `url` (TEXT) - URL da sessão no SAPL
- `detalhes_coletados` (ENUM) - Status: NAO_COLETADO, PROCESSANDO, COLETADO, ERRO
- `scraped_at` (TIMESTAMP) - Quando foi coletado

**Campos detalhados** (opcionais, coletados sob demanda):
- `session_number` (INTEGER) - Número da sessão
- `start_time` (TIMESTAMP) - Hora de início
- `end_time` (TIMESTAMP) - Hora de término
- `audio_url` (TEXT) - URL do áudio
- `video_url` (TEXT) - URL do vídeo
- `pauta_url` (TEXT) - URL do PDF da pauta
- `ata_url` (TEXT) - URL do PDF da ata
- `anexo_url` (TEXT) - URL de anexos

### session_order_of_day
Armazena a ordem do dia (pauta) de cada sessão.

**Campos**:
- `id` (UUID) - Chave primária
- `session_id` (INTEGER) - Foreign key para sessions.session_id
- `external_id` (INTEGER) - ID da ordem do dia no SAPL (UNIQUE)
- `order_number` (INTEGER) - Número da ordem
- `content` (TEXT) - Descrição resumida
- `ementa` (TEXT) - **Texto completo da matéria/ementa**
- `situacao` (TEXT) - Status atual da matéria
- `observacao` (TEXT) - Observações adicionais
- `result` (TEXT) - Resultado da votação/deliberação
- `materia_id` (INTEGER) - ID da matéria no SAPL
- `data_ordem` (DATE) - Data da ordem

**Importante**: O campo `ementa` contém o texto completo da matéria discutida, essencial para gerar resumos contextualizados.

### session_attendance
Armazena a lista de presença.

**Campos**:
- `id` (UUID) - Chave primária
- `session_id` (INTEGER) - Foreign key para sessions.session_id
- `external_id` (INTEGER) - ID único (UNIQUE)
- `parliamentarian_id` (INTEGER) - ID do parlamentar
- `parliamentarian_name` (TEXT) - Nome do parlamentar
- `present` (BOOLEAN) - Presente ou ausente

## Estratégia de Coleta

1. **Pipeline de Sessões (CRON diário)**:
   - Coleta dados básicos de todas as sessões
   - Marca `detalhes_coletados = NAO_COLETADO`

2. **API On-Demand**:
   - Quando detalhes de uma sessão são solicitados
   - Coleta detalhes completos da sessão
   - Coleta ordem do dia com ementas
   - Coleta presença
   - Marca `detalhes_coletados = COLETADO`

## Consequências

**Positivas**:
- Dados estruturados e relacionados
- Coleta incremental (básico primeiro, detalhes sob demanda)
- Informações ricas para análises e relatórios
- Campo `ementa` permite gerar resumos contextualizados

**Negativas**:
- Necessário múltiplas requisições para obter dados completos
- Dados podem ficar desatualizados se não houver refresh

