import { EventEmitter } from 'events';
import type { PipelineEvent } from '../shared/types/index.js';
import type {
  EventPayload,
  SessionDiscoveredPayload,
  DetailRequestedPayload,
  DetailCollectedPayload,
  ScrapingFailedPayload,
} from './events.js';
import { createLogger } from '../shared/logger/logger.js';

const logger = createLogger('EventEmitter');

class PipelineEventEmitter extends EventEmitter {
  /**
   * Emite evento de sessão descoberta
   */
  emitSessionDiscovered(payload: SessionDiscoveredPayload): void {
    this.emit('SESSION_DISCOVERED', payload);
    logger.info({ payload }, 'Event: SESSION_DISCOVERED');
  }

  /**
   * Emite evento de detalhe solicitado
   */
  emitDetailRequested(payload: DetailRequestedPayload): void {
    this.emit('DETALHE_REQUESTED', payload);
    logger.info({ payload }, 'Event: DETALHE_REQUESTED');
  }

  /**
   * Emite evento de detalhe coletado
   */
  emitDetailCollected(payload: DetailCollectedPayload): void {
    this.emit('DETALHE_COLLECTED', payload);
    logger.info({ payload }, 'Event: DETALHE_COLLECTED');
  }

  /**
   * Emite evento de erro no scraping
   */
  emitScrapingFailed(payload: ScrapingFailedPayload): void {
    this.emit('SCRAPING_FAILED', payload);
    logger.error({ payload }, 'Event: SCRAPING_FAILED');
  }

  /**
   * Emite evento genérico
   */
  emitEvent(event: PipelineEvent, payload: EventPayload): void {
    this.emit(event, payload);
    logger.debug({ event, payload }, `Event: ${event}`);
  }

  /**
   * Emite evento de início de scraping
   */
  emitScrapingStarted(payload: EventPayload): void {
    this.emit('SCRAPING_STARTED', payload);
    logger.info({ payload }, 'Event: SCRAPING_STARTED');
  }

  /**
   * Emite evento de conclusão de scraping
   */
  emitScrapingCompleted(payload: EventPayload): void {
    this.emit('SCRAPING_COMPLETED', payload);
    logger.info({ payload }, 'Event: SCRAPING_COMPLETED');
  }
}

export const pipelineEventEmitter = new PipelineEventEmitter();


