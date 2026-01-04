import { app } from './app.js';
import { createLogger } from '../shared/logger/logger.js';
import { env } from '../config/env.js';

const logger = createLogger('API');

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT}`);
  logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
});
