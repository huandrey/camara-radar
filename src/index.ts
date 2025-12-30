import { createLogger } from './shared/logger/logger.js';

const logger = createLogger('Main');

logger.info('Camara Data Collection Pipelines - Starting application');

// Por enquanto, apenas inicializa o logger
// Os cron jobs são executados via scripts separados
logger.info('Application initialized. Use cron scripts to run pipelines.');


