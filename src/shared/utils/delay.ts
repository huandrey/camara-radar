/**
 * Gera um delay randômico entre min e max milissegundos
 */
export function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Delay randômico padrão para scraping (10-20 segundos)
 */
export function scrapingDelay(): Promise<void> {
  return randomDelay(10000, 20000);
}


