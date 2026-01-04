import { fetchPage } from './sessions.fetcher.js';
import { parseSessions } from './sessions.parser.js';
import { normalizeSessions } from './sessions.normalizer.js';
import { upsertSessions } from './sessions.repository.js';
import {
  createSessionsMetrics,
  updateMetrics,
  addError,
  finalizeSessionsMetrics,
} from './sessions.metrics.js';
import { pipelineEventEmitter } from '../../events/event-emitter.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { PipelineOptions, PipelineResult } from './sessions.types.js';

const logger = createLogger('SessionsPipeline');

/**
 * Executa o pipeline de sessões
 */
export async function runSessionsPipeline(
  options: PipelineOptions
): Promise<PipelineResult> {
  const metrics = createSessionsMetrics();
  const year = options.year || 2025;
  const maxPages = options.maxPages || 100; // Limite de segurança
  const stopOnEmptyPage = options.stopOnEmptyPage ?? true;

  logger.info({ options }, 'Starting sessions pipeline');

  try {
    // Emitir evento de início
    pipelineEventEmitter.emitScrapingStarted({
      timestamp: new Date(),
      pipeline: 'sessions',
      mode: options.mode,
    });

    // Modo on-demand específico (futuro - quando implementar scraping de detalhes)
    if (options.mode === 'on-demand' && options.sessionId) {
      logger.info({ sessionId: options.sessionId }, 'On-demand mode for specific session');
      // Por enquanto, apenas retorna sucesso
      // No futuro, aqui faria scraping dos detalhes da sessão
      return {
        success: true,
        metrics: finalizeSessionsMetrics(metrics),
      };
    }

    // Loop de paginação
    let consecutiveEmptyPages = 0;
    const MAX_CONSECUTIVE_EMPTY = 2; // Parar após 2 páginas vazias seguidas

    for (let page = 1; page <= maxPages; page++) {
      try {
        logger.debug({ page, year }, 'Processing page');

        // Fetch
        const html = await fetchPage(page, year);

        // Parse
        const rawSessions = parseSessions(html, year);

        // Early exit se páginas vazias consecutivas
        if (rawSessions.length === 0) {
          consecutiveEmptyPages++;
          logger.info({ page, consecutiveEmptyPages }, 'Empty page encountered');
          
          if (stopOnEmptyPage && consecutiveEmptyPages >= MAX_CONSECUTIVE_EMPTY) {
            logger.info(`Stopping due to ${consecutiveEmptyPages} consecutive empty pages`);
            break;
          }
          
          // Continuar para próxima página mesmo se vazia (pode haver conteúdo depois)
          continue;
        }

        // Reset contador se encontrou sessões
        consecutiveEmptyPages = 0;

        // Normalize
        const sessions = normalizeSessions(rawSessions);

        // Upsert
        const insertedCount = await upsertSessions(sessions);

        // Atualizar métricas
        updateMetrics(metrics, sessions.length, insertedCount);

        // Emitir eventos para sessões novas
        for (const session of sessions) {
          if (insertedCount > 0) {
            pipelineEventEmitter.emitSessionDiscovered({
              timestamp: new Date(),
              pipeline: 'sessions',
              sessionId: session.sessionId,
              sessionTitle: session.title,
            });
          }
        }

        logger.info(
          { page, found: sessions.length, inserted: insertedCount },
          'Page processed successfully'
        );

        // Modo daily processa apenas página 1
        if (options.mode === 'daily' && page === 1) {
          logger.info('Daily mode: stopping after first page');
          break;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error({ page, error: err.message }, 'Error processing page');
        addError(metrics, err);

        // Continuar para próxima página mesmo com erro
        continue;
      }
    }

    // Emitir evento de conclusão
    pipelineEventEmitter.emitScrapingCompleted({
      timestamp: new Date(),
      pipeline: 'sessions',
      metrics: {
        pagesProcessed: metrics.pagesProcessed,
        sessionsFound: metrics.sessionsFound,
        sessionsInserted: metrics.sessionsInserted,
      },
    });

    const finalizedMetrics = finalizeSessionsMetrics(metrics);

    return {
      success: true,
      metrics: finalizedMetrics,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ error: err.message }, 'Pipeline failed');

    addError(metrics, err);

    pipelineEventEmitter.emitScrapingFailed({
      timestamp: new Date(),
      pipeline: 'sessions',
      error: err.message,
    });

    return {
      success: false,
      metrics: finalizeSessionsMetrics(metrics),
      error: err,
    };
  }
}

