#!/usr/bin/env tsx
/**
 * Script para testar o pipeline manualmente (sem CRON)
 * 
 * Uso: pnpm tsx scripts/test-pipeline-manual.ts
 */

import { runSessionsPipeline } from '../src/pipelines/sessions/sessions.pipeline.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('ManualTest');

async function testPipeline() {
  logger.info('🚀 Starting manual pipeline test...');
  logger.info('');

  try {
    // Teste com apenas 1 página para não demorar muito
    const result = await runSessionsPipeline({
      mode: 'daily',
      year: 2025,
      maxPages: 1,
      stopOnEmptyPage: false,
    });

    logger.info('');
    logger.info('📊 Pipeline Results:');
    logger.info(`   Success: ${result.success ? '✅' : '❌'}`);
    logger.info(`   Pages Processed: ${result.metrics.pagesProcessed}`);
    logger.info(`   Sessions Found: ${result.metrics.sessionsFound}`);
    logger.info(`   Sessions Inserted: ${result.metrics.sessionsInserted}`);
    logger.info(`   Errors: ${result.metrics.errors.length}`);

    if (result.metrics.errors.length > 0) {
      logger.warn('');
      logger.warn('⚠️  Errors encountered:');
      result.metrics.errors.forEach((error, index) => {
        logger.warn(`   ${index + 1}. ${error.message}`);
      });
    }

    if (result.error) {
      logger.error('');
      logger.error('❌ Pipeline error:', result.error.message);
      process.exit(1);
    }

    logger.info('');
    logger.info('✅ Pipeline test completed successfully!');
    logger.info('');
    logger.info('Check your Supabase dashboard to see the inserted sessions.');

  } catch (error) {
    logger.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testPipeline();


