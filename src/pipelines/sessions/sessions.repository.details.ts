import { getSupabaseClient } from '../../shared/supabase/client.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { Session } from './sessions.types.js';

const logger = createLogger('SessionsRepository');

/**
 * Atualiza os detalhes de uma sessão
 */
export async function updateSessionDetails(sessionId: number, details: Partial<Session>): Promise<void> {
  const supabase = getSupabaseClient();

  const updateData = {
    session_number: details.sessionNumber,
    start_time: details.startTime?.toISOString(),
    end_time: details.endTime?.toISOString(),
    audio_url: details.audioUrl,
    video_url: details.videoUrl,
    pauta_url: details.pautaUrl,
    ata_url: details.ataUrl,
    anexo_url: details.anexoUrl,
    detalhes_coletados: 'COLETADO',
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    logger.info({ sessionId }, 'Session details updated successfully');
  } catch (error) {
    logger.error(
      { sessionId, error: error },
      'Error updating session details'
    );
    throw error;
  }
}
