import { load } from 'cheerio';
import { createLogger } from '../../shared/logger/logger.js';
import type { SessionRaw } from './sessions.types.js';

const logger = createLogger('SessionsParser');

/**
 * Extrai ID da sessão a partir da URL
 */
function extractSessionId(urlPath: string): number {
  // URL geralmente é: /sessao/{id}/ver
  const match = urlPath.match(/\/sessao\/(\d+)/);
  if (!match) {
    throw new Error(`Could not extract session ID from URL: ${urlPath}`);
  }
  return parseInt(match[1], 10);
}

/**
 * Extrai informações do texto da sessão
 * Formato esperado: "119ª SESSÃO ORDINÁRIA da 1ª Sessão Legislativa da 19ª Legislatura"
 */
function parseSessionText(fullText: string): {
  type: string;
  legislativeSession: string;
  legislature: string;
} {
  // Extrair tipo (ORDINÁRIA, SOLENE, EXTRAORDINÁRIA, etc)
  // Procurar por "SESSÃO ORDINÁRIA", "SESSÃO SOLENE", etc
  const typeMatch = fullText.match(/SESSÃO\s+(ORDINÁRIA|SOLENE|EXTRAORDINÁRIA|ESPECIAL)/i);
  const type = typeMatch ? typeMatch[1].toUpperCase() : '';

  // Extrair sessão legislativa (ex: "1ª Sessão Legislativa")
  const sessionMatch = fullText.match(/(\d+ª)\s+Sessão\s+Legislativa/i);
  const legislativeSession = sessionMatch ? sessionMatch[1] : '';

  // Extrair legislatura (ex: "19ª Legislatura")
  const legislatureMatch = fullText.match(/(\d+ª)\s+Legislatura/i);
  const legislature = legislatureMatch ? legislatureMatch[1] : '';

  return { type, legislativeSession, legislature };
}

/**
 * Extrai data de abertura do texto
 * Formatos esperados:
 * - "Abertura: 18 de Dezembro de 2025"
 * - "Abertura: 18 de Dezembro"
 */
function extractOpeningDate(cellText: string, year: number): string {
  // Procurar por "Abertura: DD de Mês" ou "Abertura: DD de Mês de YYYY"
  const dateMatch = cellText.match(/Abertura:\s*(\d+)\s+de\s+(\w+)(?:\s+de\s+(\d+))?/i);
  if (!dateMatch) {
    throw new Error(`Could not extract opening date from: ${cellText}`);
  }

  const day = parseInt(dateMatch[1], 10);
  const monthName = dateMatch[2];
  const extractedYear = dateMatch[3] ? parseInt(dateMatch[3], 10) : year;

  // Mapear nome do mês para número
  const months: Record<string, number> = {
    janeiro: 1, fevereiro: 2, março: 3, abril: 4,
    maio: 5, junho: 6, julho: 7, agosto: 8,
    setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
  };

  const month = months[monthName.toLowerCase()];
  if (!month) {
    throw new Error(`Invalid month name: ${monthName}`);
  }

  // Formatar como DD/MM/YYYY
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${extractedYear}`;
}

/**
 * Parse de sessões a partir do HTML
 */
export function parseSessions(html: string, year: number = 2025): SessionRaw[] {
  const $ = load(html);
  const sessions: SessionRaw[] = [];

  // Estrutura real: cada linha tem 1 célula com um link e texto
  const rows = $('table tbody tr');

  if (rows.length === 0) {
    logger.warn('No sessions found in HTML');
    return sessions;
  }

  rows.each((index, element) => {
    try {
      const $row = $(element);
      const $cell = $row.find('td').first();
      
      // Pular linha de cabeçalho ou vazia
      if ($cell.length === 0) {
        return;
      }

      const cellText = $cell.text().trim();
      
      // Pular linhas que não são sessões (ex: "Resultados")
      if (!cellText.includes('SESSÃO') || !cellText.includes('Legislatura')) {
        return;
      }

      // Encontrar o link dentro da célula
      const $link = $cell.find('a').first();
      const urlPath = $link.attr('href') || '';
      const linkText = $link.text().trim();

      if (!urlPath || !linkText) {
        logger.warn({ index, cellText }, 'Missing link or link text, skipping');
        return;
      }

      // Extrair ID da URL
      const id = extractSessionId(urlPath);

      // Extrair informações do texto
      const { type, legislativeSession, legislature } = parseSessionText(linkText);

      // Extrair data de abertura
      let openingDateStr: string;
      try {
        openingDateStr = extractOpeningDate(cellText, year);
      } catch (error) {
        logger.warn(
          { index, cellText, error: error instanceof Error ? error.message : String(error) },
          'Could not extract opening date, skipping'
        );
        return;
      }

      // Título é o texto do link
      const title = linkText;

      sessions.push({
        id,
        title,
        type,
        openingDateStr,
        legislature,
        legislativeSession,
        urlPath,
      });
    } catch (error) {
      logger.error(
        { index, error: error instanceof Error ? error.message : String(error) },
        'Error parsing session row'
      );
    }
  });

  logger.info({ count: sessions.length }, 'Parsed sessions from HTML');
  return sessions;
}

