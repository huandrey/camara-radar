import cron from 'node-cron';
import { runSessionsPipeline } from '../pipelines/sessions/sessions.pipeline.js';
import { createLogger } from '../shared/logger/logger.js';

const logger = createLogger('CronDaily');

/**
 * Executa pipeline de sessões em modo diário
 */
async function executeDaily() {
  logger.info('Starting daily pipeline execution');

  try {
    const result = await runSessionsPipeline({
      mode: 'daily',
      year: 2025,
      maxPages: 1, // Apenas primeira página
      stopOnEmptyPage: false,
    });

    if (result.success) {
      logger.info('Daily pipeline completed successfully');
    } else {
      logger.error({ error: result.error?.message }, 'Daily pipeline failed');
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Unexpected error in daily pipeline'
    );
  }
}

// Executar imediatamente na primeira vez
executeDaily();

// Agendar execução diária às 18:30
cron.schedule('30 18 * * *', () => {
  logger.info('Scheduled daily execution triggered');
  executeDaily();
});

logger.info('Daily cron scheduler started (runs daily at 18:30)');


