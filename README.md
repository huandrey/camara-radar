# Câmara Radar

Sistema modular de coleta de dados públicos da Câmara Municipal de Campina Grande (SAPL).

## Arquitetura

O projeto é estruturado como um sistema de pipelines modulares, onde cada pipeline é independente mas compartilha infraestrutura comum. O pipeline de sessões é o primeiro, servindo como base arquitetural para pipelines futuros.

### Modos de Operação

- **Coleta Agendada**: Execução automática via CRON (backfill e rotina diária)
- **Coleta Sob Demanda**: Execução sob demanda quando usuário solicita dados não coletados

## Estrutura do Projeto

```
src/
├── pipelines/        # Pipelines modulares
│   └── sessions/     # Pipeline de sessões (implementado)
├── shared/           # Módulos compartilhados
│   ├── http/         # HTTP client
│   ├── logger/       # Sistema de logging
│   ├── metrics/      # Sistema de métricas
│   ├── supabase/     # Cliente Supabase
│   └── utils/        # Utilitários
├── api/              # API on-demand
├── cron/             # Scripts de CRON
├── events/           # Sistema de eventos
└── config/           # Configuração
```

## Setup

### Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Credenciais do Supabase (URL e chave de API)

### Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env` e configure:
- `SUPABASE_URL` - URL do seu projeto Supabase
- `SUPABASE_KEY` - Chave anônima do Supabase
- `NODE_ENV` - Ambiente (development/production)

4. Execute a migration do banco de dados:

Execute o SQL em `src/shared/supabase/migrations/001_create_sessions_table.sql` no Supabase SQL Editor.

### Build

```bash
npm run build
```

### Desenvolvimento

```bash
npm run dev
```

## Execução

### Pipeline de Sessões

#### Modo Backfill (a cada 1 hora)

```bash
npm run cron:backfill
```

#### Modo Diário (1x por dia às 18:30)

```bash
npm run cron:daily
```

### On-Demand

Para coleta sob demanda de uma sessão específica, use a função `scrapeSessionOnDemand()` do módulo `src/api/on-demand.ts`.

## API HTTP

O Câmara Radar expõe uma API REST para consulta e coleta de dados sob demanda.

### Iniciar o servidor

```bash
npm run api:dev
```

O servidor estará disponível em `http://localhost:3000`.

### Documentação

Para documentação completa dos endpoints e exemplos de uso, consulte [docs/API.md](docs/API.md).

### Exemplos rápidos

```bash
# Obter detalhes de uma sessão
curl http://localhost:3000/api/sessions/123

# Acionar coleta de dados
curl -X POST http://localhost:3000/api/sessions/123/collect

# Listar sessões
curl "http://localhost:3000/api/sessions?page=1&limit=10"
```

### Endpoints disponíveis

- `GET /api/health` - Health check
- `GET /api/sessions/:id` - Obter detalhes de uma sessão
- `POST /api/sessions/:id/collect` - Acionar coleta de dados
- `GET /api/sessions` - Listar sessões com paginação

## Pipeline de Sessões

### Funcionalidades

- Coleta de sessões legislativas da Câmara Municipal
- Normalização e validação de dados
- Deduplicação automática (upsert)
- Persistência no Supabase
- Sistema de status (`detalhes_coletados`)
- Logs e métricas padronizados

### Fonte de Dados

- URL: `https://sapl.campinagrande.pb.leg.br/sessao/pesquisar-sessao`
- Parâmetros: `page`, `data_inicio__year`
- Padrão: 10 sessões por página

### Modelo de Dados

```typescript
interface Session {
  id: number;
  title: string;
  type: string;
  openingDate: Date;
  legislature: string;
  legislativeSession: string;
  url: string;
  detalhesColetados: 'NAO_COLETADO' | 'PROCESSANDO' | 'COLETADO' | 'ERRO';
  scrapedAt: Date;
}
```

## Logs e Métricas

O sistema produz logs estruturados e métricas padronizadas:

- Tempo total de execução
- Quantidade de páginas processadas
- Sessões encontradas
- Sessões novas inseridas
- Erros encontrados

## Testes

```bash
npm test
```

## Pipelines Futuros

O sistema está preparado para os seguintes pipelines:

1. **Pipeline de Ementas** - Coleta de ementas por sessão
2. **Pipeline de Tramitação** - Coleta de tramitações
3. **Pipeline de Detalhes** - Coleta de detalhes completos

Veja `src/pipelines/README.md` para mais detalhes sobre dependências e contratos.

## Contribuindo

Este é um projeto cívico sério. Contribuições são bem-vindas!

## Licença

MIT


