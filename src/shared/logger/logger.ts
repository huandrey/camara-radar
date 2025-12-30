import pino from 'pino';
import { env } from '../../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
});

/**
 * Cria um logger com contexto específico
 */
export function createLogger(context: string) {
  return logger.child({ context });
}


