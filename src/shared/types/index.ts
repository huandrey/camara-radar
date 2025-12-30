/**
 * Tipos compartilhados entre pipelines
 */

export type DetailStatus = 'NAO_COLETADO' | 'PROCESSANDO' | 'COLETADO' | 'ERRO';

/**
 * Eventos do sistema (preparação para pipelines futuros)
 */
export type PipelineEvent =
  | 'SESSION_DISCOVERED'
  | 'EMENTAS_DISCOVERED'
  | 'DETALHE_REQUESTED'
  | 'DETALHE_COLLECTED'
  | 'TRAMITACAO_COLLECTED'
  | 'SCRAPING_FAILED'
  | 'SCRAPING_STARTED'
  | 'SCRAPING_COMPLETED';


