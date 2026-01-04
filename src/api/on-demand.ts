import { runSessionsPipeline } from '../pipelines/sessions/sessions.pipeline.js';
import { getSessionByExternalId, updateDetailStatus, upsertSessions } from '../pipelines/sessions/sessions.repository.js';
import { updateSessionDetails } from '../pipelines/sessions/sessions.repository.details.js';
import { fetchSessionDetails } from '../pipelines/sessions/sessions.details.fetcher.js';
import { fetchSessionSummary } from '../pipelines/sessions/sessions.summary.fetcher.js';
import { parseSessionText } from '../pipelines/sessions/sessions.parser.js';
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
  let existingSession = await getSessionByExternalId(sessionId);

  // Se não existir, tentar buscar na API e criar
  if (!existingSession) {
    logger.info({ sessionId }, 'Session not found in database, attempting to fetch from source');
    
    try {
      const { details, raw } = await fetchSessionDetails(sessionId);
      const summary = await fetchSessionSummary(sessionId);
      
      // Merge summary data into details
      if (summary.startTime) details.startTime = new Date(summary.startTime);
      if (summary.endTime) details.endTime = new Date(summary.endTime);
      // Note: boardMembers are not yet in the Session type or DB schema, 
      // but we are fetching them as requested. We might need to add a column later.
      
      // Parse dos dados básicos a partir do __str__
      const parsedInfo = parseSessionText(raw.__str__);
      
      // Construir objeto Session completo
      const newSession: Session = {
        sessionId: raw.id,
        title: raw.__str__,
        type: parsedInfo.type,
        legislature: parsedInfo.legislature,
        legislativeSession: parsedInfo.legislativeSession,
        openingDate: details.startTime || new Date(), // Fallback se não tiver data
        url: `https://sapl.campinagrande.pb.leg.br/sessao/${raw.id}`,
        detalhesColetados: 'COLETADO',
        scrapedAt: new Date(),
        ...details
      };

      // Salvar no banco
      await upsertSessions([newSession]);
      
      // Atualizar detalhes específicos (caso upsertSessions não cubra tudo ou para garantir)
      await updateSessionDetails(sessionId, details);

      logger.info({ sessionId }, 'Session created successfully on-demand');
      
      // Retornar a sessão criada
      const createdSession = await getSessionByExternalId(sessionId);
      if (!createdSession) throw new Error('Failed to retrieve created session');
      
      return createdSession;

    } catch (error) {
      logger.error({ sessionId, error }, 'Failed to create session on-demand');
      throw new Error(`Session ${sessionId} not found and could not be created`);
    }
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

    // Realizar o scraping dos detalhes
    const { details } = await fetchSessionDetails(sessionId);
    const summary = await fetchSessionSummary(sessionId);

    // Merge summary data
    if (summary.startTime) details.startTime = new Date(summary.startTime);
    if (summary.endTime) details.endTime = new Date(summary.endTime);

    // Salvar no banco
    await updateSessionDetails(sessionId, details);

    // Retornar sessão atualizada
    const updatedSession = await getSessionByExternalId(sessionId);
    
    if (!updatedSession) {
       throw new Error('Failed to retrieve updated session');
    }

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


