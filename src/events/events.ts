/**
 * Tipos de eventos do sistema
 */
export { type PipelineEvent } from '../shared/types/index.js';

/**
 * Payload base para eventos
 */
export interface EventPayload {
  timestamp: Date;
  pipeline?: string;
  [key: string]: unknown;
}

/**
 * Evento de sessão descoberta
 */
export interface SessionDiscoveredPayload extends EventPayload {
  sessionId: number;
  sessionTitle: string;
}

/**
 * Evento de detalhe solicitado
 */
export interface DetailRequestedPayload extends EventPayload {
  sessionId: number;
}

/**
 * Evento de detalhe coletado
 */
export interface DetailCollectedPayload extends EventPayload {
  sessionId: number;
}

/**
 * Evento de erro no scraping
 */
export interface ScrapingFailedPayload extends EventPayload {
  error: string;
  sessionId?: number;
}


