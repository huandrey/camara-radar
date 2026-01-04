import { getSupabaseClient } from '../../shared/supabase/client.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { Session } from './sessions.types.js';
import type { DetailStatus } from '../../shared/types/index.js';

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
    session_id: session.sessionId,
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
        onConflict: 'session_id',
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
        error: error,
        count: records.length,
      },
      'Error upserting sessions'
    );
    throw error;
  }
}

/**
 * Busca uma sessão por ID externo (session_id)
 */
export async function getSessionByExternalId(sessionId: number): Promise<Session | null> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
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
      sessionId: data.session_id,
      title: data.title,
      type: data.type,
      openingDate: new Date(data.opening_date),
      legislature: data.legislature,
      legislativeSession: data.legislative_session,
      url: data.url,
      detalhesColetados: data.detalhes_coletados,
      scrapedAt: new Date(data.scraped_at),
      // Campos detalhados
      sessionNumber: data.session_number,
      startTime: data.start_time ? new Date(data.start_time) : undefined,
      endTime: data.end_time ? new Date(data.end_time) : undefined,
      audioUrl: data.audio_url,
      videoUrl: data.video_url,
      pautaUrl: data.pauta_url,
      ataUrl: data.ata_url,
      anexoUrl: data.anexo_url,
    };
  } catch (error) {
    logger.error(
      { sessionId, error: error instanceof Error ? error.message : String(error) },
      'Error fetching session by External ID'
    );
    throw error;
  }
}

/**
 * Atualiza o status de detalhes coletados de uma sessão (pelo session_id)
 */
export async function updateDetailStatus(
  sessionId: number,
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
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    logger.debug({ sessionId, status }, 'Updated session detail status');
  } catch (error) {
    logger.error(
      { sessionId, status, error: error instanceof Error ? error.message : String(error) },
      'Error updating session detail status'
    );
    throw error;
  }
}

/**
 * Lista sessões com paginação e filtros
 */
export async function listSessions(
  options: {
    limit?: number;
    offset?: number;
    status?: DetailStatus;
  } = {}
): Promise<Session[]> {
  const { limit = 20, offset = 0, status } = options;
  const supabase = getSupabaseClient();

  try {
    let query = supabase
      .from('sessions')
      .select('*')
      .order('opening_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('detalhes_coletados', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return (data || []).map((record) => ({
      id: record.id,
      sessionId: record.session_id,
      title: record.title,
      type: record.type,
      openingDate: new Date(record.opening_date),
      legislature: record.legislature,
      legislativeSession: record.legislative_session,
      url: record.url,
      detalhesColetados: record.detalhes_coletados,
      scrapedAt: new Date(record.scraped_at),
      // Campos detalhados
      sessionNumber: record.session_number,
      startTime: record.start_time ? new Date(record.start_time) : undefined,
      endTime: record.end_time ? new Date(record.end_time) : undefined,
      audioUrl: record.audio_url,
      videoUrl: record.video_url,
      pautaUrl: record.pauta_url,
      ataUrl: record.ata_url,
      anexoUrl: record.anexo_url,
    }));
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Error listing sessions'
    );
    throw error;
  }
}



