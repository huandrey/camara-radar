import { createLogger } from '../../shared/logger/logger.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const logger = createLogger('SessionsAttendanceFetcher');

export interface AttendanceItem {
  id: number;
  __str__: string;
  sessao_plenaria: number;
  parlamentar: number;
}

interface AttendanceResponse {
  pagination: any;
  results: AttendanceItem[];
}

// Simple hash function to generate stable IDs for scraped items
function generateHash(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

async function fetchAttendanceFromHtml(sessionId: number): Promise<AttendanceItem[]> {
  const url = `https://sapl.campinagrande.pb.leg.br/sessao/${sessionId}/presencaordemdia`;
  logger.info({ sessionId, url }, 'Fetching attendance from HTML');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch attendance HTML: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: AttendanceItem[] = [];

    $('.container-detail .row .col-md-6 label[for="parlamentar"]').each((_, element) => {
      const text = $(element).text().trim();
      // Format: "- NAME / PARTY"
      // We want to extract "NAME"
      const parts = text.replace(/^- /, '').split(' / ');
      const name = parts[0]?.trim();
      
      if (name) {
        // Generate a stable ID since HTML doesn't provide one
        // We use a large offset to avoid collision with real IDs (usually < 10M)
        const fakeId = 900000000 + generateHash(`${sessionId}-${name}`);
        
        items.push({
          id: fakeId,
          __str__: `Sessão: ${sessionId} Parlamentar: ${name}`,
          sessao_plenaria: sessionId,
          parlamentar: 0 // We don't have the parliamentarian ID from HTML
        });
      }
    });

    return items;
  } catch (error) {
    logger.error({ sessionId, error }, 'Error fetching attendance from HTML');
    return [];
  }
}

export async function fetchAttendance(sessionId: number): Promise<AttendanceItem[]> {
  const url = `https://sapl.campinagrande.pb.leg.br/api/sessao/presencaordemdia/?sessao_plenaria=${sessionId}&format=json`;
  logger.info({ sessionId, url }, 'Fetching attendance');

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch attendance: ${response.statusText}`);
    }

    const data = (await response.json()) as AttendanceResponse;
    
    let results = data.results;
    let nextUrl = data.pagination.links.next;

    while (nextUrl) {
        logger.info({ sessionId, nextUrl }, 'Fetching next page of attendance');
        const nextResponse = await fetch(nextUrl);
        if (!nextResponse.ok) break;
        const nextData = (await nextResponse.json()) as AttendanceResponse;
        results = results.concat(nextData.results);
        nextUrl = nextData.pagination.links.next;
    }

    if (results.length === 0) {
      logger.info({ sessionId }, 'API returned empty results, trying HTML scraping');
      return fetchAttendanceFromHtml(sessionId);
    }

    return results;
  } catch (error) {
    logger.error({ sessionId, error }, 'Error fetching attendance');
    // Fallback to HTML on API error
    return fetchAttendanceFromHtml(sessionId);
  }
}
