import { runSessionsPipeline } from '../../src/pipelines/sessions/sessions.pipeline.js';
import { fetchPage } from '../../src/pipelines/sessions/sessions.fetcher.js';
import { parseSessions } from '../../src/pipelines/sessions/sessions.parser.js';
import { normalizeSessions } from '../../src/pipelines/sessions/sessions.normalizer.js';
import { upsertSessions } from '../../src/pipelines/sessions/sessions.repository.js';

// Mock all dependencies
jest.mock('../../src/pipelines/sessions/sessions.fetcher.js');
jest.mock('../../src/pipelines/sessions/sessions.parser.js');
jest.mock('../../src/pipelines/sessions/sessions.normalizer.js');
jest.mock('../../src/pipelines/sessions/sessions.repository.js');
jest.mock('../../src/shared/supabase/client.js', () => ({
  getSupabaseClient: jest.fn(),
}));
jest.mock('../../src/events/event-emitter.js', () => ({
  pipelineEventEmitter: {
    emitScrapingStarted: jest.fn(),
    emitScrapingCompleted: jest.fn(),
    emitSessionDiscovered: jest.fn(),
    emitScrapingFailed: jest.fn(),
  },
}));

describe('Sessions Pipeline Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute full pipeline flow', async () => {
    const mockHtml = '<html><table><tbody><tr><td>Test</td></tr></tbody></table></html>';
    const mockRawSessions = [
      {
        id: 123,
        title: 'Test Session',
        type: 'Ordinária',
        openingDateStr: '15/03/2025',
        legislature: '2023-2027',
        legislativeSession: '1ª',
        urlPath: '/sessao/123/ver',
      },
    ];
    const mockSessions = [
      {
        id: 123,
        title: 'Test Session',
        type: 'Ordinária',
        openingDate: new Date('2025-03-15'),
        legislature: '2023-2027',
        legislativeSession: '1ª',
        url: 'https://sapl.campinagrande.pb.leg.br/sessao/123/ver',
        detalhesColetados: 'NAO_COLETADO' as const,
        scrapedAt: new Date(),
      },
    ];

    (fetchPage as jest.Mock).mockResolvedValue(mockHtml);
    (parseSessions as jest.Mock).mockReturnValue(mockRawSessions);
    (normalizeSessions as jest.Mock).mockReturnValue(mockSessions);
    (upsertSessions as jest.Mock).mockResolvedValue(1);

    const result = await runSessionsPipeline({
      mode: 'daily',
      year: 2025,
      maxPages: 1,
    });

    expect(result.success).toBe(true);
    expect(fetchPage).toHaveBeenCalledWith(1, 2025);
    expect(parseSessions).toHaveBeenCalledWith(mockHtml);
    expect(normalizeSessions).toHaveBeenCalledWith(mockRawSessions);
    expect(upsertSessions).toHaveBeenCalledWith(mockSessions);
  });

  it('should handle empty page with early exit', async () => {
    (fetchPage as jest.Mock).mockResolvedValue('<html></html>');
    (parseSessions as jest.Mock).mockReturnValue([]);

    const result = await runSessionsPipeline({
      mode: 'daily',
      year: 2025,
      maxPages: 1,
      stopOnEmptyPage: true,
    });

    expect(result.success).toBe(true);
    expect(upsertSessions).not.toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    (fetchPage as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await runSessionsPipeline({
      mode: 'daily',
      year: 2025,
      maxPages: 1,
    });

    // O pipeline trata erros de página parcialmente e continua
    // Retorna success: true mas com erros nas métricas
    expect(result.success).toBe(true);
    expect(result.metrics.errors.length).toBeGreaterThan(0);
  });
});

