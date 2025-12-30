/**
 * Interface padronizada para métricas de pipelines
 */
export interface PipelineMetrics {
  startTime: Date;
  endTime?: Date;
  pagesProcessed: number;
  recordsFound: number;
  recordsInserted: number;
  errors: Error[];
}

/**
 * Cria métricas iniciais
 */
export function createMetrics(): PipelineMetrics {
  return {
    startTime: new Date(),
    pagesProcessed: 0,
    recordsFound: 0,
    recordsInserted: 0,
    errors: [],
  };
}

/**
 * Finaliza métricas calculando tempo total
 */
export function finalizeMetrics(metrics: PipelineMetrics): PipelineMetrics {
  return {
    ...metrics,
    endTime: new Date(),
  };
}

/**
 * Calcula duração em segundos
 */
export function getDurationSeconds(metrics: PipelineMetrics): number {
  if (!metrics.endTime) {
    return 0;
  }
  return (metrics.endTime.getTime() - metrics.startTime.getTime()) / 1000;
}

/**
 * Formata métricas para log
 */
export function formatMetrics(metrics: PipelineMetrics): string {
  const duration = getDurationSeconds(metrics);
  return `Duration: ${duration.toFixed(2)}s | Pages: ${metrics.pagesProcessed} | Found: ${metrics.recordsFound} | Inserted: ${metrics.recordsInserted} | Errors: ${metrics.errors.length}`;
}


