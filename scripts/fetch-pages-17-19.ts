#!/usr/bin/env tsx
/**
 * Script para puxar apenas as páginas 17, 18 e 19
 */

import { fetchPage } from '../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../src/pipelines/sessions/sessions.parser.js';
import { normalizeSessions } from '../src/pipelines/sessions/sessions.normalizer.js';
import { upsertSessions } from '../src/pipelines/sessions/sessions.repository.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('FetchPages17-19');

async function fetchPages17to19() {
  logger.info('Fetching pages 17, 18 and 19...');
  logger.info('');

  const year = 2025;
  const pages = [17, 18, 19];
  let totalFound = 0;
  let totalInserted = 0;

  for (const page of pages) {
    try {
      logger.info(`📥 Fetching page ${page}...`);
      const html = await fetchPage(page, year);

      logger.info(`🔍 Parsing page ${page}...`);
      const rawSessions = parseSessions(html, year);

      if (rawSessions.length === 0) {
        logger.warn(`⚠️  Page ${page}: No sessions found`);
        continue;
      }

      logger.info(`✅ Page ${page}: Found ${rawSessions.length} sessions`);

      const sessions = normalizeSessions(rawSessions);
      const insertedCount = await upsertSessions(sessions);

      totalFound += sessions.length;
      totalInserted += insertedCount;

      logger.info(`💾 Page ${page}: Inserted ${insertedCount} sessions`);
      logger.info('');

    } catch (error) {
      logger.error(`❌ Page ${page}: Error - ${error instanceof Error ? error.message : String(error)}`);
      logger.info('');
    }
  }

  logger.info('📊 Summary:');
  logger.info(`   Total found: ${totalFound}`);
  logger.info(`   Total inserted: ${totalInserted}`);
  logger.info('');
  logger.info('✅ Done!');
}

fetchPages17to19();

