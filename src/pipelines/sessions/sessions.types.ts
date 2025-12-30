import type { DetailStatus } from '../../shared/types/index.js';

/**
 * Status de coleta de detalhes
 */
export type { DetailStatus } from '../../shared/types/index.js';

/**
 * Sessão legislativa normalizada
 */
export interface Session {
  id: number;
  title: string;
  type: string;
  openingDate: Date;
  legislature: string;
  legislativeSession: string;
  url: string;
  detalhesColetados: DetailStatus;
  scrapedAt: Date;
}

/**
 * Dados brutos extraídos do HTML
 */
export interface SessionRaw {
  id: number;
  title: string;
  type: string;
  openingDateStr: string;
  legislature: string;
  legislativeSession: string;
  urlPath: string;
}

/**
 * Opções de execução do pipeline
 */
export interface PipelineOptions {
  mode: 'backfill' | 'daily' | 'on-demand';
  year?: number;
  maxPages?: number;
  stopOnEmptyPage?: boolean;
  sessionId?: number; // Para modo on-demand específico
}

/**
 * Resultado da execução do pipeline
 */
export interface PipelineResult {
  success: boolean;
  metrics: {
    startTime: Date;
    endTime?: Date;
    pagesProcessed: number;
    sessionsFound: number;
    sessionsInserted: number;
    errors: Error[];
  };
  error?: Error;
}


