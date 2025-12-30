#!/usr/bin/env tsx
/**
 * Script para verificar quantas sessões cada página tem
 */

import { fetchPage } from '../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../src/pipelines/sessions/sessions.parser.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('CheckPages');

async function checkAllPages() {
  logger.info('Checking all pages for 2025...');
  logger.info('');

  const year = 2025;
  let emptyPagesCount = 0;
  let totalSessions = 0;

  for (let page = 1; page <= 25; page++) {
    try {
      const html = await fetchPage(page, year);
      const sessions = parseSessions(html, year);

      if (sessions.length === 0) {
        emptyPagesCount++;
        logger.warn(`Page ${page}: EMPTY (${emptyPagesCount} empty pages in a row)`);
        
        // Se tiver 2 páginas vazias seguidas, provavelmente acabou
        if (emptyPagesCount >= 2) {
          logger.info(`Stopping at page ${page} - found ${emptyPagesCount} empty pages in a row`);
          break;
        }
      } else {
        emptyPagesCount = 0; // Reset counter
        totalSessions += sessions.length;
        logger.info(`Page ${page}: ${sessions.length} sessions (total: ${totalSessions})`);
      }
    } catch (error) {
      logger.error(`Page ${page}: ERROR - ${error instanceof Error ? error.message : String(error)}`);
      emptyPagesCount++;
    }
  }

  logger.info('');
  logger.info(`Total sessions found: ${totalSessions}`);
}

checkAllPages();


