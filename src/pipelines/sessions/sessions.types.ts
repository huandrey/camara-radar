import type { DetailStatus } from '../../shared/types/index.js';

/**
 * Status de coleta de detalhes
 */
export type { DetailStatus } from '../../shared/types/index.js';

/**
 * Sessão legislativa normalizada
 */
export interface Session {
  id?: string; // UUID do Supabase (opcional na criação)
  sessionId: number; // ID externo da Câmara
  title: string;
  type: string;
  openingDate: Date;
  legislature: string;
  legislativeSession: string;
  url: string;
  detalhesColetados: DetailStatus;
  scrapedAt: Date;
  
  // Campos detalhados (opcionais pois podem não ter sido coletados ainda)
  sessionNumber?: number;
  startTime?: Date;
  endTime?: Date;
  audioUrl?: string;
  videoUrl?: string;
  pautaUrl?: string;
  ataUrl?: string;
  anexoUrl?: string;
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


