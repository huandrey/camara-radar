import { getSupabaseClient } from '../../shared/supabase/client.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { Session } from './sessions.types.js';

const logger = createLogger('SessionsRepository');

/**
 * Insere ou atualiza sessões no banco (upsert)
 */
export async function upsertSessions(sessions: Session[]): Promise<number> {
  if (sessions.length === 0) {
    return 0;
  }

  const supabase = getSupabaseClient();

  // Converter Session para formato do banco
  const records = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    type: session.type,
    opening_date: session.openingDate.toISOString(),
    legislature: session.legislature,
    legislative_session: session.legislativeSession,
    url: session.url,
    detalhes_coletados: session.detalhesColetados,
    scraped_at: session.scrapedAt.toISOString(),
  }));

  logger.debug({ count: records.length }, 'Upserting sessions');

  try {
    const { data, error } = await supabase
      .from('sessions')
      .upsert(records, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      throw error;
    }

    const insertedCount = data?.length || 0;
    logger.info({ count: insertedCount }, 'Sessions upserted successfully');

    return insertedCount;
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        count: records.length,
      },
      'Error upserting sessions'
    );
    throw error;
  }
}

/**
 * Busca uma sessão por ID
 */
export async function getSessionById(id: number): Promise<Session | null> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Converter do formato do banco para Session
    return {
      id: data.id,
      title: data.title,
      type: data.type,
      openingDate: new Date(data.opening_date),
      legislature: data.legislature,
      legislativeSession: data.legislative_session,
      url: data.url,
      detalhesColetados: data.detalhes_coletados,
      scrapedAt: new Date(data.scraped_at),
    };
  } catch (error) {
    logger.error(
      { id, error: error instanceof Error ? error.message : String(error) },
      'Error fetching session by ID'
    );
    throw error;
  }
}

/**
 * Atualiza o status de detalhes coletados de uma sessão
 */
export async function updateDetailStatus(
  id: number,
  status: 'NAO_COLETADO' | 'PROCESSANDO' | 'COLETADO' | 'ERRO'
): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        detalhes_coletados: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    logger.debug({ id, status }, 'Updated session detail status');
  } catch (error) {
    logger.error(
      { id, status, error: error instanceof Error ? error.message : String(error) },
      'Error updating session detail status'
    );
    throw error;
  }
}


