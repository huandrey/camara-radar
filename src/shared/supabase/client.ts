import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../../config/env.js';
import { createLogger } from '../logger/logger.js';

const logger = createLogger('SupabaseClient');

let supabaseClient: SupabaseClient | null = null;

/**
 * Obtém ou cria o cliente Supabase (singleton)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    logger.info('Initializing Supabase client');
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
  }
  return supabaseClient;
}


