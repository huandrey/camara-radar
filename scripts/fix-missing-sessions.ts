#!/usr/bin/env tsx
/**
 * Script para buscar e inserir sessões que estão faltando
 */

import { fetchPage } from '../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../src/pipelines/sessions/sessions.parser.js';
import { normalizeSessions } from '../src/pipelines/sessions/sessions.normalizer.js';
import { upsertSessions } from '../src/pipelines/sessions/sessions.repository.js';
import { getSupabaseClient } from '../src/shared/supabase/client.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('FixMissing');

async function fixMissingSessions() {
  logger.info('🔧 Fixing missing sessions...');
  logger.info('');

  const supabase = getSupabaseClient();
  const year = 2025;

  // Buscar IDs do banco
  const { data: dbSessions } = await supabase
    .from('sessions')
    .select('id');

  const dbIds = new Set(dbSessions?.map(s => s.id) || []);
  logger.info(`Database has ${dbIds.size} sessions`);
  logger.info('');

  // Verificar todas as páginas e inserir o que falta
  let totalInserted = 0;

  for (let page = 1; page <= 20; page++) {
    try {
      logger.info(`📥 Checking page ${page}...`);
      const html = await fetchPage(page, year);
      const rawSessions = parseSessions(html, year);

      if (rawSessions.length === 0) {
        logger.info(`Page ${page}: Empty, skipping`);
        continue;
      }

      // Filtrar apenas as que não estão no banco
      const missingSessions = rawSessions.filter(s => !dbIds.has(s.id));

      if (missingSessions.length === 0) {
        logger.info(`Page ${page}: All ${rawSessions.length} sessions already in DB`);
        continue;
      }

      logger.info(`Page ${page}: Found ${missingSessions.length} missing sessions out of ${rawSessions.length}`);

      // Normalizar e inserir
      const sessions = normalizeSessions(missingSessions);
      const insertedCount = await upsertSessions(sessions);

      totalInserted += insertedCount;
      logger.info(`Page ${page}: Inserted ${insertedCount} sessions`);
      logger.info('');

    } catch (error) {
      logger.error(`Page ${page}: Error - ${error instanceof Error ? error.message : String(error)}`);
      logger.info('');
    }
  }

  logger.info('');
  logger.info(`✅ Total inserted: ${totalInserted} sessions`);
  logger.info('✅ Done!');
}

fixMissingSessions();


