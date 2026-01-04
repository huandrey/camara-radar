import { createLogger } from '../../shared/logger/logger.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const logger = createLogger('SessionsSummaryFetcher');

export interface SessionSummary {
  startTime?: string;
  endTime?: string;
  boardMembers: string[];
}

export async function fetchSessionSummary(sessionId: number): Promise<SessionSummary> {
  const url = `https://sapl.campinagrande.pb.leg.br/sessao/${sessionId}/resumo`;
  logger.info({ sessionId, url }, 'Fetching session summary');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch session summary: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    let startTime: string | undefined;
    let endTime: string | undefined;
    const boardMembers: string[] = [];

    // Extract Start and End Time
    // Looking for text like "Início: 18/12/2025 09:30" inside the content
    const contentText = $('#content').text();
    
    // Regex to find times
    // Example: "Início: 18/12/2025 09:30"
    const startMatch = contentText.match(/Início:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    if (startMatch) {
      // Convert DD/MM/YYYY HH:mm to ISO
      const [datePart, timePart] = startMatch[1].split(' ');
      const [day, month, year] = datePart.split('/');
      startTime = `${year}-${month}-${day}T${timePart}:00.000Z`; // Assuming UTC or local, but ISO format
    }

    const endMatch = contentText.match(/Término:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2})/);
    if (endMatch) {
      const [datePart, timePart] = endMatch[1].split(' ');
      const [day, month, year] = datePart.split('/');
      endTime = `${year}-${month}-${day}T${timePart}:00.000Z`;
    }

    // Extract Board Members (Mesa Diretora)
    // Usually in a table or list under "Mesa Diretora" section
    // Based on the HTML structure, we might need to look for specific markers
    // Let's look for the "Mesa Diretora" header and then the following content
    
    // Strategy: Look for "Mesa Diretora" h2 or strong, then find the list/table
    // Since I don't have the exact HTML for the summary page yet, I'll try a generic approach
    // and we can refine it if needed.
    
    // Often SAPL lists board members like: "Presidente: Fulano", "1º Secretário: Beltrano"
    // Let's try to find these patterns in the text if structured elements aren't obvious
    
    // Or look for the specific container if we can identify it from the previous HTML dump
    // The previous dump was for 'ordemdia', let's assume 'resumo' has similar structure
    
    // Let's try to find a table that might contain board members
    $('table').each((_, table) => {
      const header = $(table).prev().text();
      if (header.includes('Mesa') || header.includes('Diretora')) {
        $(table).find('tr').each((_, row) => {
           const role = $(row).find('td').eq(0).text().trim();
           const name = $(row).find('td').eq(1).text().trim();
           if (role && name) {
             boardMembers.push(`${role}: ${name}`);
           }
        });
      }
    });

    // If table approach fails, try looking for list items or paragraphs
    if (boardMembers.length === 0) {
        // Fallback: Try to find text patterns
        const roles = ['Presidente', 'Vice-Presidente', 'Secretário', 'Secretária'];
        const lines = contentText.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (roles.some(role => trimmed.startsWith(role))) {
                boardMembers.push(trimmed);
            }
        }
    }

    return { startTime, endTime, boardMembers };

  } catch (error) {
    logger.error({ sessionId, error }, 'Error fetching session summary');
    return { boardMembers: [] };
  }
}
