import { parseBrazilianDate } from '../../shared/utils/date.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { Session, SessionRaw } from './sessions.types.js';

const logger = createLogger('SessionsNormalizer');

const BASE_URL = 'https://sapl.campinagrande.pb.leg.br';

/**
 * Normaliza uma sessão raw em Session
 */
export function normalizeSession(raw: SessionRaw): Session {
  try {
    // Parse da data
    const openingDate = parseBrazilianDate(raw.openingDateStr);

    // Construir URL completa
    const url = raw.urlPath.startsWith('http')
      ? raw.urlPath
      : `${BASE_URL}${raw.urlPath.startsWith('/') ? '' : '/'}${raw.urlPath}`;

    // Sanitizar strings
    const title = raw.title.trim();
    const type = raw.type.trim();
    const legislature = raw.legislature.trim();
    const legislativeSession = raw.legislativeSession.trim();

    // Validação básica
    if (!title) {
      throw new Error('Title is required');
    }
    if (!type) {
      throw new Error('Type is required');
    }
    if (!legislature) {
      throw new Error('Legislature is required');
    }
    if (isNaN(openingDate.getTime())) {
      throw new Error(`Invalid opening date: ${raw.openingDateStr}`);
    }

    const session: Session = {
      id: raw.id,
      title,
      type,
      openingDate,
      legislature,
      legislativeSession,
      url,
      detalhesColetados: 'NAO_COLETADO', // Sempre inicia como não coletado
      scrapedAt: new Date(),
    };

    return session;
  } catch (error) {
    logger.error(
      {
        raw,
        error: error instanceof Error ? error.message : String(error),
      },
      'Error normalizing session'
    );
    throw error;
  }
}

/**
 * Normaliza múltiplas sessões
 */
export function normalizeSessions(rawSessions: SessionRaw[]): Session[] {
  const sessions: Session[] = [];

  for (const raw of rawSessions) {
    try {
      const session = normalizeSession(raw);
      sessions.push(session);
    } catch (error) {
      logger.warn(
        { raw, error: error instanceof Error ? error.message : String(error) },
        'Skipping session due to normalization error'
      );
    }
  }

  return sessions;
}


