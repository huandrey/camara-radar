#!/usr/bin/env tsx
/**
 * Script para identificar quais sessões estão faltando no banco
 */

import { getSupabaseClient } from '../src/shared/supabase/client.js';
import { fetchPage } from '../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../src/pipelines/sessions/sessions.parser.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('FindMissing');

async function findMissingSessions() {
  logger.info('🔍 Finding missing sessions...');
  logger.info('');

  const supabase = getSupabaseClient();
  const year = 2025;

  // Buscar todas as sessões do banco
  logger.info('📥 Fetching sessions from database...');
  const { data: dbSessions, error: dbError } = await supabase
    .from('sessions')
    .select('id')
    .order('id', { ascending: true });

  if (dbError) {
    logger.error('Error fetching from database:', dbError);
    return;
  }

  const dbIds = new Set(dbSessions?.map(s => s.id) || []);
  logger.info(`✅ Found ${dbIds.size} sessions in database`);
  logger.info('');

  // Verificar cada página
  logger.info('🔍 Checking all pages...');
  const allPageIds = new Set<number>();
  const pageSessions: Record<number, number[]> = {};

  for (let page = 1; page <= 20; page++) {
    try {
      const html = await fetchPage(page, year);
      const sessions = parseSessions(html, year);
      
      const pageIds = sessions.map(s => s.id);
      pageSessions[page] = pageIds;
      pageIds.forEach(id => allPageIds.add(id));

      logger.info(`Page ${page}: ${sessions.length} sessions`);
    } catch (error) {
      logger.error(`Page ${page}: Error - ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  logger.info('');
  logger.info(`📊 Total unique sessions found in pages: ${allPageIds.size}`);
  logger.info('');

  // Encontrar IDs que estão nas páginas mas não no banco
  const missingIds: number[] = [];
  allPageIds.forEach(id => {
    if (!dbIds.has(id)) {
      missingIds.push(id);
    }
  });

  missingIds.sort((a, b) => a - b);

  logger.info(`❌ Missing sessions: ${missingIds.length}`);
  if (missingIds.length > 0) {
    logger.info('');
    logger.info('Missing IDs:');
    missingIds.forEach(id => {
      // Encontrar em qual página está
      const page = Object.keys(pageSessions).find(p => pageSessions[Number(p)].includes(id));
      logger.info(`  ID ${id} (should be on page ${page})`);
    });
  }

  logger.info('');
  
  // Verificar página 17 especificamente
  logger.info('🔍 Checking page 17 specifically...');
  try {
    const html17 = await fetchPage(17, year);
    const sessions17 = parseSessions(html17, year);
    
    logger.info(`Page 17: Found ${sessions17.length} sessions`);
    logger.info('Session IDs on page 17:');
    sessions17.forEach(s => {
      const inDb = dbIds.has(s.id);
      logger.info(`  ID ${s.id} - ${inDb ? '✅ In DB' : '❌ MISSING'} - ${s.title.substring(0, 50)}`);
    });

    const missingFrom17 = sessions17.filter(s => !dbIds.has(s.id));
    if (missingFrom17.length > 0) {
      logger.info('');
      logger.info(`⚠️  ${missingFrom17.length} sessions from page 17 are missing from database:`);
      missingFrom17.forEach(s => {
        logger.info(`  ID ${s.id}: ${s.title}`);
      });
    }
  } catch (error) {
    logger.error(`Error checking page 17: ${error instanceof Error ? error.message : String(error)}`);
  }

  logger.info('');
  logger.info('✅ Analysis complete!');
}

findMissingSessions();


