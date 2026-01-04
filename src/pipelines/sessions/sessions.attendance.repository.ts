import { getSupabaseClient } from '../../shared/supabase/client.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { AttendanceItem } from './sessions.attendance.fetcher.js';

const logger = createLogger('SessionsAttendanceRepository');

function extractParliamentarianName(str: string): string {
  // Format: "Sessão: ... Parlamentar: NOME DO PARLAMENTAR"
  const parts = str.split('Parlamentar:');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return str;
}

export async function upsertAttendance(sessionId: number, items: AttendanceItem[]): Promise<void> {
  const supabase = getSupabaseClient();

  if (items.length === 0) return;

  const records = items.map(item => ({
    session_id: sessionId,
    external_id: item.id,
    parliamentarian_id: item.parlamentar,
    parliamentarian_name: extractParliamentarianName(item.__str__),
    present: true,
    updated_at: new Date().toISOString()
  }));

  try {
    const { error } = await supabase
      .from('session_attendance')
      .upsert(records, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
    
    logger.info({ sessionId, count: items.length }, 'Upserted attendance items');
  } catch (error) {
    logger.error({ sessionId, error }, 'Error upserting attendance');
    throw error;
  }
}

export async function getAttendance(sessionId: number) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_attendance')
    .select('*')
    .eq('session_id', sessionId)
    .order('parliamentarian_name', { ascending: true });

  if (error) throw error;
  return data;
}
