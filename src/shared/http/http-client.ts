import fetch from 'node-fetch';
import { scrapingDelay } from '../utils/delay.js';
import { createLogger } from '../logger/logger.js';

const logger = createLogger('HttpClient');

interface HttpClientOptions {
  retries?: number;
  retryDelay?: number;
  useRandomDelay?: boolean;
}

const DEFAULT_OPTIONS: Required<HttpClientOptions> = {
  retries: 3,
  retryDelay: 1000,
  useRandomDelay: true,
};

/**
 * Headers padrão para requisições
 */
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

/**
 * Wrapper sobre node-fetch com retry logic e delay randômico
 */
export async function httpGet(
  url: string,
  options: HttpClientOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Delay randômico antes da requisição (se habilitado)
  if (opts.useRandomDelay) {
    await scrapingDelay();
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.retries; attempt++) {
    try {
      logger.debug({ url, attempt: attempt + 1 }, 'Making HTTP request');

      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      logger.debug({ url, length: text.length }, 'HTTP request successful');
      
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < opts.retries) {
        const delay = opts.retryDelay * Math.pow(2, attempt); // Exponential backoff
        logger.warn(
          { url, attempt: attempt + 1, delay, error: lastError.message },
          'HTTP request failed, retrying'
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error(
          { url, attempts: attempt + 1, error: lastError.message },
          'HTTP request failed after all retries'
        );
      }
    }
  }

  throw lastError || new Error('Unknown error');
}


