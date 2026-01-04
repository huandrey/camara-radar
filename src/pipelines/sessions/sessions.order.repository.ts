import { getSupabaseClient } from '../../shared/supabase/client.js';
import { createLogger } from '../../shared/logger/logger.js';
import type { OrderOfDayItem } from './sessions.order.fetcher.js';

const logger = createLogger('SessionsOrderRepository');

export async function upsertOrderOfDay(sessionId: number, items: OrderOfDayItem[]): Promise<void> {
  const supabase = getSupabaseClient();

  if (items.length === 0) return;

  const records = items.map(item => ({
    session_id: sessionId,
    external_id: item.id,
    order_number: item.numero_ordem,
    content: item.__str__,
    result: item.resultado,
    materia_id: item.materia,
    data_ordem: item.data_ordem,
    ementa: item.ementa,
    situacao: item.situacao,
    observacao: item.observacao,
    updated_at: new Date().toISOString()
  }));

  try {
    const { error } = await supabase
      .from('session_order_of_day')
      .upsert(records, {
        onConflict: 'external_id',
        ignoreDuplicates: false
      });

    if (error) throw error;
    
    logger.info({ sessionId, count: items.length }, 'Upserted order of day items');
  } catch (error) {
    logger.error({ sessionId, error }, 'Error upserting order of day');
    throw error;
  }
}

export async function getOrderOfDay(sessionId: number) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('session_order_of_day')
    .select('*')
    .eq('session_id', sessionId)
    .order('order_number', { ascending: true });

  if (error) throw error;
  return data;
}
