#!/usr/bin/env tsx
/**
 * Script de debug para investigar por que nada está sendo inserido
 * 
 * Uso: pnpm tsx scripts/debug-pipeline.ts
 */

import { fetchPage } from '../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../src/pipelines/sessions/sessions.parser.js';
import { normalizeSessions } from '../src/pipelines/sessions/sessions.normalizer.js';
import { createLogger } from '../src/shared/logger/logger.js';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('DebugPipeline');

async function debugPipeline() {
  logger.info('🔍 Starting debug pipeline...');
  logger.info('');

  try {
    // Passo 1: Fetch
    logger.info('📥 Step 1: Fetching page...');
    const html = await fetchPage(1, 2025);
    logger.info(`✅ HTML received: ${html.length} characters`);
    logger.info('');

    // Salvar HTML para inspeção
    const htmlPath = path.join(process.cwd(), 'debug-html.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');
    logger.info(`💾 HTML saved to: ${htmlPath}`);
    logger.info('');

    // Passo 2: Parse
    logger.info('🔍 Step 2: Parsing HTML...');
    const rawSessions = parseSessions(html);
    logger.info(`📊 Raw sessions found: ${rawSessions.length}`);
    logger.info('');

    if (rawSessions.length === 0) {
      logger.warn('⚠️  No sessions found in HTML!');
      logger.warn('');
      logger.warn('This could mean:');
      logger.warn('1. The HTML structure is different than expected');
      logger.warn('2. The selectors in parser need adjustment');
      logger.warn('3. The page is actually empty');
      logger.warn('');
      logger.warn('Check the saved HTML file to see the actual structure.');
      logger.warn('You may need to adjust selectors in: src/pipelines/sessions/sessions.parser.ts');
      return;
    }

    // Mostrar primeira sessão raw
    logger.info('📋 First raw session:');
    logger.info(JSON.stringify(rawSessions[0], null, 2));
    logger.info('');

    // Passo 3: Normalize
    logger.info('🔄 Step 3: Normalizing sessions...');
    const sessions = normalizeSessions(rawSessions);
    logger.info(`✅ Normalized sessions: ${sessions.length}`);
    logger.info('');

    if (sessions.length === 0) {
      logger.warn('⚠️  No sessions after normalization!');
      logger.warn('This means normalization is failing. Check the logs above for errors.');
      return;
    }

    // Mostrar primeira sessão normalizada
    logger.info('📋 First normalized session:');
    logger.info(JSON.stringify({
      ...sessions[0],
      openingDate: sessions[0].openingDate.toISOString(),
      scrapedAt: sessions[0].scrapedAt.toISOString(),
    }, null, 2));
    logger.info('');

    // Passo 4: Verificar estrutura HTML
    logger.info('🔍 Step 4: Analyzing HTML structure...');
    const cheerio = await import('cheerio');
    const $ = cheerio.load(html);
    
    const tables = $('table').length;
    const tableRows = $('table tbody tr').length;
    const links = $('table a').length;
    
    logger.info(`📊 HTML Analysis:`);
    logger.info(`   Tables found: ${tables}`);
    logger.info(`   Table rows found: ${tableRows}`);
    logger.info(`   Links in tables: ${links}`);
    logger.info('');

    if (tables === 0) {
      logger.warn('⚠️  No tables found in HTML!');
      logger.warn('The page structure might be different.');
    }

    if (tableRows === 0 && tables > 0) {
      logger.warn('⚠️  Tables found but no rows!');
      logger.warn('Check if the table uses <tbody> or has a different structure.');
    }

    // Mostrar estrutura da primeira tabela
    if (tables > 0) {
      logger.info('📋 First table structure:');
      const firstTable = $('table').first();
      const headers = firstTable.find('thead th, thead td').map((i, el) => $(el).text().trim()).get();
      const firstRowCells = firstTable.find('tbody tr').first().find('td').map((i, el) => ({
        index: i,
        text: $(el).text().trim(),
        html: $(el).html()?.substring(0, 100),
      })).get();
      
      logger.info(`   Headers: ${headers.length > 0 ? headers.join(', ') : 'None found'}`);
      logger.info(`   First row cells: ${firstRowCells.length}`);
      firstRowCells.forEach((cell, idx) => {
        logger.info(`     Cell ${idx}: "${cell.text}"`);
      });
      logger.info('');
    }

    logger.info('✅ Debug completed!');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Check the HTML file: debug-html.html');
    logger.info('2. If no sessions found, adjust selectors in sessions.parser.ts');
    logger.info('3. If sessions found but not inserted, check Supabase connection');

  } catch (error) {
    logger.error('❌ Error during debug:', error);
    if (error instanceof Error) {
      logger.error('Stack:', error.stack);
    }
  }
}

debugPipeline();


