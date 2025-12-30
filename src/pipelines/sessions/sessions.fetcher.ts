import { httpGet } from '../../shared/http/http-client.js';
import { createLogger } from '../../shared/logger/logger.js';

const logger = createLogger('SessionsFetcher');

const BASE_URL = 'https://sapl.campinagrande.pb.leg.br/sessao/pesquisar-sessao';

/**
 * Busca uma página de sessões
 */
export async function fetchPage(page: number, year: number): Promise<string> {
  const url = new URL(BASE_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('data_inicio__year', String(year));

  logger.debug({ page, year, url: url.toString() }, 'Fetching sessions page');

  try {
    const html = await httpGet(url.toString(), {
      useRandomDelay: true, // Delay randômico entre páginas
    });
    return html;
  } catch (error) {
    logger.error(
      { page, year, error: error instanceof Error ? error.message : String(error) },
      'Failed to fetch sessions page'
    );
    throw error;
  }
}


