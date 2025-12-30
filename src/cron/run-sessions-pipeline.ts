import cron from 'node-cron';
import { runSessionsPipeline } from '../pipelines/sessions/sessions.pipeline.js';
import { createLogger } from '../shared/logger/logger.js';

const logger = createLogger('CronBackfill');

/**
 * Executa pipeline de sessões em modo backfill
 */
async function executeBackfill() {
  logger.info('Starting backfill pipeline execution');

  try {
    const result = await runSessionsPipeline({
      mode: 'backfill',
      year: 2025,
      stopOnEmptyPage: true,
    });

    if (result.success) {
      logger.info('Backfill pipeline completed successfully');
    } else {
      logger.error({ error: result.error?.message }, 'Backfill pipeline failed');
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Unexpected error in backfill pipeline'
    );
  }
}

// Executar imediatamente na primeira vez
executeBackfill();

// Agendar execução a cada 1 hora
cron.schedule('0 * * * *', () => {
  logger.info('Scheduled backfill execution triggered');
  executeBackfill();
});

logger.info('Backfill cron scheduler started (runs every hour)');


