import { createLogger } from '../../shared/logger/logger.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const logger = createLogger('SessionsOrderFetcher');

export interface OrderOfDayItem {
  id: number;
  __str__: string;
  data_ordem: string;
  numero_ordem: number;
  resultado: string;
  sessao_plenaria: number;
  materia: number;
  ementa?: string;
  situacao?: string;
  observacao?: string;
}

interface OrderOfDayResponse {
  pagination: any;
  results: OrderOfDayItem[];
}

async function fetchOrderOfDayFromHtml(sessionId: number): Promise<OrderOfDayItem[]> {
  const url = `https://sapl.campinagrande.pb.leg.br/sessao/${sessionId}/ordemdia`;
  logger.info({ sessionId, url }, 'Fetching order of day from HTML');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch order of day HTML: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: OrderOfDayItem[] = [];

    $('table.table tbody tr').each((_, element) => {
      const $row = $(element);
      const orderLink = $row.find('td:nth-child(1) a');
      const orderNumber = parseInt(orderLink.text().trim()) || 0;
      const externalId = parseInt(orderLink.attr('href')?.split('/').pop() || '0') || 0;
      
      const contentCell = $row.find('td:nth-child(2)');
      const materiaLink = contentCell.find('a').first();
      const materiaId = parseInt(materiaLink.attr('id') || '0') || 0;
      const content = contentCell.text().trim().replace(/\s+/g, ' ');
      
      const detailsCell = $row.find('td:nth-child(3)');
      const ementa = detailsCell.find('.dont-break-out').first().text().trim();
      
      // Extract status from text nodes
      let situacao = '';
      detailsCell.contents().each((_, el) => {
        if (el.type === 'text') {
          const text = $(el).text().trim();
          if (text && text !== '-' && text !== '&nbsp;') {
            situacao += text + ' ';
          }
        }
      });
      situacao = situacao.replace(/^-\s*-\s*/, '').trim();

      const divs = detailsCell.find('.dont-break-out');
      const observacao = divs.length > 1 ? divs.last().text().trim() : '';
      
      const result = $row.find('td:nth-child(4)').text().trim();

      if (externalId) {
        items.push({
          id: externalId,
          __str__: content,
          data_ordem: new Date().toISOString().split('T')[0], // Fallback date
          numero_ordem: orderNumber,
          resultado: result,
          sessao_plenaria: sessionId,
          materia: materiaId,
          ementa,
          situacao,
          observacao
        });
      }
    });

    return items;
  } catch (error) {
    logger.error({ sessionId, error }, 'Error fetching order of day from HTML');
    return [];
  }
}

export async function fetchOrderOfDay(sessionId: number): Promise<OrderOfDayItem[]> {
  const url = `https://sapl.campinagrande.pb.leg.br/api/sessao/ordemdia/?sessao_plenaria=${sessionId}&format=json`;
  logger.info({ sessionId, url }, 'Fetching order of day');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch order of day: ${response.statusText}`);
    }

    const data = (await response.json()) as OrderOfDayResponse;
    
    let results = data.results;
    let nextUrl = data.pagination.links.next;

    while (nextUrl) {
        logger.info({ sessionId, nextUrl }, 'Fetching next page of order of day');
        const nextResponse = await fetch(nextUrl);
        if (!nextResponse.ok) break;
        const nextData = (await nextResponse.json()) as OrderOfDayResponse;
        results = results.concat(nextData.results);
        nextUrl = nextData.pagination.links.next;
    }

    // Always fetch HTML to get extra details (Ementa, Situação, Observação)
    // because API response is missing them.
    try {
      const htmlResults = await fetchOrderOfDayFromHtml(sessionId);
      
      if (results.length === 0) {
        return htmlResults;
      }

      // Merge HTML details into API results
      return results.map(apiItem => {
        const htmlItem = htmlResults.find(h => h.id === apiItem.id);
        if (htmlItem) {
          return {
            ...apiItem,
            ementa: htmlItem.ementa,
            situacao: htmlItem.situacao,
            observacao: htmlItem.observacao
          };
        }
        return apiItem;
      });
    } catch (htmlError) {
      logger.warn({ sessionId, error: htmlError }, 'Failed to fetch HTML details, returning API results only');
      return results;
    }

  } catch (error) {
    logger.error({ sessionId, error }, 'Error fetching order of day');
    // Fallback to HTML on API error
    return fetchOrderOfDayFromHtml(sessionId);
  }
}
