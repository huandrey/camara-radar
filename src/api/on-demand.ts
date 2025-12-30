import { runSessionsPipeline } from '../pipelines/sessions/sessions.pipeline.js';
import { getSessionById, updateDetailStatus } from '../pipelines/sessions/sessions.repository.js';
import { pipelineEventEmitter } from '../events/event-emitter.js';
import { createLogger } from '../shared/logger/logger.js';
import type { Session } from '../pipelines/sessions/sessions.types.js';

const logger = createLogger('OnDemandAPI');

/**
 * Scraping on-demand de uma sessão específica
 */
export async function scrapeSessionOnDemand(sessionId: number): Promise<Session> {
  logger.info({ sessionId }, 'On-demand scraping requested');

  // Verificar se sessão existe e obter status atual
  const existingSession = await getSessionById(sessionId);

  if (!existingSession) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const currentStatus = existingSession.detalhesColetados;

  // Se já coletado, retornar dados existentes
  if (currentStatus === 'COLETADO') {
    logger.info({ sessionId }, 'Session details already collected, returning existing data');
    return existingSession;
  }

  // Se está processando, retornar erro
  if (currentStatus === 'PROCESSANDO') {
    logger.warn({ sessionId }, 'Session is already being processed');
    throw new Error(`Session ${sessionId} is already being processed`);
  }

  // Se erro anterior, tentar novamente
  if (currentStatus === 'ERRO') {
    logger.info({ sessionId }, 'Previous error detected, retrying');
  }

  try {
    // Atualizar status para PROCESSANDO
    await updateDetailStatus(sessionId, 'PROCESSANDO');

    // Emitir evento de solicitação
    pipelineEventEmitter.emitDetailRequested({
      timestamp: new Date(),
      pipeline: 'sessions',
      sessionId,
    });

    // Executar pipeline em modo on-demand
    // Por enquanto, apenas atualiza o status
    // No futuro, aqui faria scraping dos detalhes da sessão
    const result = await runSessionsPipeline({
      mode: 'on-demand',
      sessionId,
    });

    if (!result.success) {
      throw result.error || new Error('Pipeline execution failed');
    }

    // Atualizar status para COLETADO
    await updateDetailStatus(sessionId, 'COLETADO');

    // Emitir evento de coleta concluída
    pipelineEventEmitter.emitDetailCollected({
      timestamp: new Date(),
      pipeline: 'sessions',
      sessionId,
    });

    // Buscar sessão atualizada
    const updatedSession = await getSessionById(sessionId);
    if (!updatedSession) {
      throw new Error(`Session ${sessionId} not found after update`);
    }

    logger.info({ sessionId }, 'On-demand scraping completed successfully');
    return updatedSession;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ sessionId, error: err.message }, 'On-demand scraping failed');

    // Atualizar status para ERRO
    await updateDetailStatus(sessionId, 'ERRO').catch((updateError) => {
      logger.error({ sessionId, error: updateError }, 'Failed to update status to ERRO');
    });

    // Emitir evento de erro
    pipelineEventEmitter.emitScrapingFailed({
      timestamp: new Date(),
      pipeline: 'sessions',
      error: err.message,
      sessionId,
    });

    throw err;
  }
}


