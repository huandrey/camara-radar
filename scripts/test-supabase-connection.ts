#!/usr/bin/env tsx
/**
 * Script de teste para verificar conexão e inserção no Supabase
 * 
 * Uso: pnpm tsx scripts/test-supabase-connection.ts
 */

import { getSupabaseClient } from '../src/shared/supabase/client.js';
import { createLogger } from '../src/shared/logger/logger.js';

const logger = createLogger('SupabaseTest');

async function testSupabaseConnection() {
  logger.info('Testing Supabase connection...');

  try {
    const supabase = getSupabaseClient();

    // Teste 1: Verificar se a tabela existe
    logger.info('Test 1: Checking if sessions table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('sessions')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        logger.error('❌ Table "sessions" does not exist!');
        logger.error('Please run the migration SQL in Supabase SQL Editor:');
        logger.error('File: src/shared/supabase/migrations/001_create_sessions_table.sql');
        process.exit(1);
      }
      throw tableError;
    }

    logger.info('✅ Table "sessions" exists');

    // Teste 2: Verificar se o enum existe
    logger.info('Test 2: Checking if detail_status enum exists...');
    const { data: enumCheck, error: enumError } = await supabase
      .rpc('check_enum_exists', { enum_name: 'detail_status' })
      .single();

    // Se a função não existir, tentar inserir um registro de teste para verificar o enum
    if (enumError && enumError.code !== '42883') {
      logger.warn('Could not check enum directly, trying insert test...');
    }

    // Teste 3: Tentar inserir um registro de teste
    logger.info('Test 3: Testing insert operation...');
    const testSession = {
      id: 999999, // ID de teste que não deve existir
      title: 'Test Session - DELETE ME',
      type: 'Test',
      opening_date: new Date().toISOString(),
      legislature: '2023-2027',
      legislative_session: 'Test',
      url: 'https://test.example.com',
      detalhes_coletados: 'NAO_COLETADO',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('sessions')
      .insert(testSession)
      .select()
      .single();

    if (insertError) {
      logger.error('❌ Insert failed:', insertError.message);
      logger.error('Error code:', insertError.code);
      logger.error('Error details:', insertError.details);
      logger.error('Error hint:', insertError.hint);
      
      if (insertError.code === '23505') {
        logger.warn('Record already exists (this is OK for upsert test)');
      } else {
        process.exit(1);
      }
    } else {
      logger.info('✅ Insert successful!');
      logger.info('Inserted record:', insertData);

      // Limpar o registro de teste
      logger.info('Cleaning up test record...');
      await supabase
        .from('sessions')
        .delete()
        .eq('id', 999999);
      logger.info('✅ Test record deleted');
    }

    // Teste 4: Testar upsert (onConflict)
    logger.info('Test 4: Testing upsert operation...');
    const { data: upsertData, error: upsertError } = await supabase
      .from('sessions')
      .upsert(testSession, { onConflict: 'id' })
      .select()
      .single();

    if (upsertError) {
      logger.error('❌ Upsert failed:', upsertError.message);
      process.exit(1);
    }

    logger.info('✅ Upsert successful!');
    
    // Limpar novamente
    await supabase.from('sessions').delete().eq('id', 999999);

    // Teste 5: Verificar contagem de registros
    logger.info('Test 5: Checking record count...');
    const { count, error: countError } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error('❌ Count failed:', countError.message);
      process.exit(1);
    }

    logger.info(`✅ Current record count: ${count}`);

    logger.info('');
    logger.info('🎉 All tests passed! Supabase is ready to use.');
    logger.info('');
    logger.info('Next steps:');
    logger.info('1. Run the pipeline: pnpm cron:daily');
    logger.info('2. Or test manually: pnpm tsx scripts/test-pipeline-manual.ts');

  } catch (error) {
    logger.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testSupabaseConnection();


