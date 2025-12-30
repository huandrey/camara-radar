import type { PipelineMetrics } from '../../shared/metrics/metrics.js';
import { formatMetrics } from '../../shared/metrics/metrics.js';
import { createLogger } from '../../shared/logger/logger.js';

const logger = createLogger('SessionsMetrics');

/**
 * Métricas específicas do pipeline de sessões
 */
export interface SessionsPipelineMetrics extends PipelineMetrics {
  sessionsFound: number;
  sessionsInserted: number;
}

/**
 * Cria métricas iniciais para o pipeline de sessões
 */
export function createSessionsMetrics(): SessionsPipelineMetrics {
  return {
    startTime: new Date(),
    pagesProcessed: 0,
    recordsFound: 0,
    recordsInserted: 0,
    sessionsFound: 0,
    sessionsInserted: 0,
    errors: [],
  };
}

/**
 * Atualiza métricas com dados de uma página processada
 */
export function updateMetrics(
  metrics: SessionsPipelineMetrics,
  sessionsFound: number,
  sessionsInserted: number
): void {
  metrics.pagesProcessed += 1;
  metrics.recordsFound += sessionsFound;
  metrics.recordsInserted += sessionsInserted;
  metrics.sessionsFound += sessionsFound;
  metrics.sessionsInserted += sessionsInserted;
}

/**
 * Adiciona erro às métricas
 */
export function addError(metrics: SessionsPipelineMetrics, error: Error): void {
  metrics.errors.push(error);
}

/**
 * Finaliza métricas e loga resultado
 */
export function finalizeSessionsMetrics(
  metrics: SessionsPipelineMetrics
): SessionsPipelineMetrics {
  const finalized = {
    ...metrics,
    endTime: new Date(),
  };

  logger.info(
    {
      duration: finalized.endTime.getTime() - finalized.startTime.getTime(),
      pagesProcessed: finalized.pagesProcessed,
      sessionsFound: finalized.sessionsFound,
      sessionsInserted: finalized.sessionsInserted,
      errors: finalized.errors.length,
    },
    formatMetrics(finalized)
  );

  return finalized;
}


