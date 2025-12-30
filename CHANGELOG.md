# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-30

### Initial Release

First stable release of the Câmara Radar scraping system for Campina Grande City Council.

### Added

#### Core Infrastructure
- **Project Setup**: Initial TypeScript project configuration with strict mode enabled
- **Package Management**: pnpm lock file for reproducible builds
- **Environment Configuration**: Type-safe environment variable validation system
  - Support for `SUPABASE_URL`, `SUPABASE_KEY`, `NODE_ENV`, `LOG_LEVEL`
  - Automatic validation of required variables
  - Environment-specific configurations

#### Shared Modules
- **Logger System**: Structured logging using Pino with pretty formatting for development
- **HTTP Client**: Robust HTTP client with:
  - Automatic retry logic with exponential backoff (up to 3 attempts)
  - Random delays for rate limiting
  - Custom User-Agent headers
  - Comprehensive error handling
- **Date Utilities**: Brazilian date parsing utilities
- **Delay Utilities**: Rate limiting utilities for scraping operations
- **Metrics System**: Pipeline execution metrics tracking
- **Shared Types**: Common TypeScript types including `DetailStatus` enum

#### Database
- **Supabase Integration**: 
  - Singleton Supabase client
  - Database migrations for sessions table
  - `detail_status` enum type (NAO_COLETADO, PROCESSANDO, COLETADO, ERRO)
  - Indexes on `opening_date`, `scraped_at`, and `detalhes_coletados`
  - Upsert operations for deduplication

#### Event System
- **Pipeline Event Emitter**: Event-driven architecture for pipeline operations
  - `SCRAPING_STARTED` - Pipeline execution started
  - `SESSION_DISCOVERED` - New session found
  - `SCRAPING_COMPLETED` - Pipeline execution completed successfully
  - `SCRAPING_FAILED` - Pipeline execution failed
  - `DETALHE_REQUESTED` - Detail scraping requested
  - `DETALHE_COLLECTED` - Detail scraping completed
  - Structured event payloads with timestamps

#### Sessions Pipeline
- **Fetcher**: HTTP requests to SAPL (Sistema de Apoio ao Processo Legislativo)
- **Parser**: HTML parsing using Cheerio to extract session data
- **Normalizer**: Data validation and normalization
  - Brazilian date parsing
  - URL construction
  - String sanitization
  - Field validation
- **Repository**: Database operations
  - Upsert sessions (prevents duplicates)
  - Get session by ID
  - Update detail collection status
- **Metrics**: Comprehensive tracking of:
  - Execution time
  - Pages processed
  - Sessions found
  - Sessions inserted
  - Errors encountered
- **Pipeline Orchestrator**: Main pipeline with three modes:
  - **Backfill Mode**: Processes multiple pages for historical data collection
  - **Daily Mode**: Processes only the first page for new sessions
  - **On-Demand Mode**: Processes specific sessions when requested
- **Pagination**: Automatic pagination with empty page detection
- **Error Handling**: Per-page error handling with continuation logic

#### Automation
- **Cron Schedulers**:
  - **Backfill Scheduler**: Runs every hour to collect historical data
  - **Daily Scheduler**: Runs daily at 18:30 to collect new sessions
  - Both schedulers execute immediately on startup

#### API
- **On-Demand API**: Manual session scraping functionality
  - `scrapeSessionOnDemand()` function
  - Status management to prevent duplicate processing
  - Automatic status updates (NAO_COLETADO → PROCESSANDO → COLETADO/ERRO)
  - Error handling and recovery

#### Testing
- **Integration Tests**: Test suite for sessions pipeline
- **Unit Tests**: Tests for HTTP client, date utilities, and delay utilities

#### Development Tools
- **Utility Scripts**:
  - `test-supabase-connection`: Test Supabase connectivity
  - `test-pipeline-manual`: Manual pipeline testing
  - `debug-pipeline`: Pipeline debugging tool
  - `check-all-pages`: Verify all pages are accessible
  - `fetch-pages-17-19`: Fetch specific page ranges
  - `find-missing-sessions`: Identify missing sessions
  - `fix-missing-sessions`: Fix missing sessions

#### Documentation
- **README.md**: Comprehensive project documentation
  - Architecture overview
  - Setup instructions
  - Usage examples
  - Pipeline documentation
- **SUPABASE_SETUP.md**: Detailed Supabase setup guide
- **LICENSE**: MIT License file
- **.env.example**: Environment variables template

### Technical Details

- **Language**: TypeScript 5.3.3
- **Runtime**: Node.js 18+
- **Package Manager**: pnpm
- **Database**: Supabase (PostgreSQL)
- **Testing**: Jest with ts-jest
- **Logging**: Pino with pino-pretty
- **Scraping**: Cheerio + node-fetch
- **Scheduling**: node-cron

### Data Model

The system collects legislative sessions with the following structure:
- Session ID (primary key)
- Title
- Type (ORDINÁRIA, SOLENE, EXTRAORDINÁRIA, etc.)
- Opening Date
- Legislature
- Legislative Session
- URL
- Detail Collection Status
- Timestamps (scraped_at, created_at, updated_at)

### Source

Data is collected from:
- **URL**: `https://sapl.campinagrande.pb.leg.br/sessao/pesquisar-sessao`
- **Format**: HTML pages with pagination
- **Rate Limiting**: Random delays between requests

---

## [Unreleased]

### Planned Features
- Pipeline for collecting session details
- Pipeline for collecting bills (ementas)
- Pipeline for tracking bill progress (tramitação)
- API endpoints for querying collected data
- Webhook support for event notifications

