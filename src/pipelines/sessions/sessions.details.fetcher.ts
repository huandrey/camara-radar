import { createLogger } from '../../shared/logger/logger.js';
import type { Session } from './sessions.types.js';
import fetch from 'node-fetch';

const logger = createLogger('SessionsDetailsFetcher');

export interface SaplApiResponse {
  id: number;
  __str__: string;
  data_inicio: string;
  hora_inicio: string;
  data_fim: string;
  hora_fim: string;
  numero: number;
  url_audio: string;
  url_video: string;
  upload_pauta: string | null;
  upload_ata: string | null;
  upload_anexo: string | null;
}

/**
 * Busca detalhes de uma sessão específica usando a API do SAPL
 */
export async function fetchSessionDetails(sessionId: number): Promise<{ details: Partial<Session>, raw: SaplApiResponse }> {
  const apiUrl = `https://sapl.campinagrande.pb.leg.br/api/sessao/sessaoplenaria/${sessionId}`;
  
  logger.info({ sessionId, apiUrl }, 'Fetching session details from API');

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch session details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SaplApiResponse;

    // Parse dates
    const startTime = data.data_inicio && data.hora_inicio 
      ? new Date(`${data.data_inicio}T${data.hora_inicio}:00-03:00`) // Assuming BRT
      : undefined;

    const endTime = data.data_fim && data.hora_fim
      ? new Date(`${data.data_fim}T${data.hora_fim}:00-03:00`)
      : undefined;

    return {
      raw: data,
      details: {
        sessionNumber: data.numero,
        startTime,
        endTime,
        audioUrl: data.url_audio || undefined,
        videoUrl: data.url_video || undefined,
        pautaUrl: data.upload_pauta || undefined,
        ataUrl: data.upload_ata || undefined,
        anexoUrl: data.upload_anexo || undefined,
        detalhesColetados: 'COLETADO'
      }
    };

  } catch (error) {
    logger.error({ sessionId, error: error instanceof Error ? error.message : String(error) }, 'Error fetching session details');
    throw error;
  }
}
