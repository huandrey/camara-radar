import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createLogger } from '../shared/logger/logger.js';
import { scrapeSessionOnDemand } from './on-demand.js';
import { getSessionById, listSessions } from '../pipelines/sessions/sessions.repository.js';

const logger = createLogger('APIServer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Tipos para respostas de erro
interface ErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}

// Middleware de tratamento de erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ error: err.message, path: _req.path }, 'Unhandled error');
  
  const errorResponse: ErrorResponse = {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? { message: err.message } : undefined,
  };
  
  res.status(500).json(errorResponse);
});

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// GET /api/sessions/:id - Obter detalhes de uma sessão específica
app.get('/api/sessions/:id', async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    
    if (isNaN(sessionId)) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid session ID',
        code: 'INVALID_PARAMETER',
        details: { parameter: 'id', value: req.params.id },
      };
      return res.status(400).json(errorResponse);
    }

    const session = await getSessionById(sessionId);

    if (!session) {
      const errorResponse: ErrorResponse = {
        error: `Session ${sessionId} not found`,
        code: 'NOT_FOUND',
        details: { sessionId },
      };
      return res.status(404).json(errorResponse);
    }

    // Converter datas para ISO string para JSON
    const response = {
      id: session.id,
      title: session.title,
      type: session.type,
      openingDate: session.openingDate.toISOString(),
      legislature: session.legislature,
      legislativeSession: session.legislativeSession,
      url: session.url,
      detalhesColetados: session.detalhesColetados,
      scrapedAt: session.scrapedAt.toISOString(),
    };

    return res.json(response);
  } catch (error) {
    logger.error({ error, sessionId: req.params.id }, 'Error fetching session');
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch session',
      code: 'FETCH_ERROR',
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return res.status(500).json(errorResponse);
  }
});

// POST /api/sessions/:id/collect - Acionar coleta de dados de uma sessão
app.post('/api/sessions/:id/collect', async (req: Request, res: Response) => {
  try {
    const sessionId = parseInt(req.params.id, 10);
    
    if (isNaN(sessionId)) {
      const errorResponse: ErrorResponse = {
        error: 'Invalid session ID',
        code: 'INVALID_PARAMETER',
        details: { parameter: 'id', value: req.params.id },
      };
      return res.status(400).json(errorResponse);
    }

    const session = await scrapeSessionOnDemand(sessionId);

    const response = {
      success: true,
      message: 'Data collection completed successfully',
      session: {
        id: session.id,
        title: session.title,
        type: session.type,
        openingDate: session.openingDate.toISOString(),
        legislature: session.legislature,
        legislativeSession: session.legislativeSession,
        url: session.url,
        detalhesColetados: session.detalhesColetados,
        scrapedAt: session.scrapedAt.toISOString(),
      },
    };

    return res.json(response);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error({ error: err.message, sessionId: req.params.id }, 'Error collecting session data');

    // Tratamento específico para diferentes tipos de erro
    if (err.message.includes('not found')) {
      const errorResponse: ErrorResponse = {
        error: err.message,
        code: 'NOT_FOUND',
        details: { sessionId: parseInt(req.params.id, 10) },
      };
      return res.status(404).json(errorResponse);
    }

    if (err.message.includes('already being processed')) {
      const errorResponse: ErrorResponse = {
        error: err.message,
        code: 'ALREADY_PROCESSING',
        details: { sessionId: parseInt(req.params.id, 10) },
      };
      return res.status(409).json(errorResponse);
    }

    const errorResponse: ErrorResponse = {
      error: 'Failed to collect session data',
      code: 'COLLECTION_ERROR',
      details: { message: err.message },
    };
    return res.status(500).json(errorResponse);
  }
});

// GET /api/sessions - Listar sessões com paginação
app.get('/api/sessions', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (page < 1) {
      const errorResponse: ErrorResponse = {
        error: 'Page must be greater than 0',
        code: 'INVALID_PARAMETER',
        details: { parameter: 'page', value: page },
      };
      return res.status(400).json(errorResponse);
    }

    if (limit < 1 || limit > 100) {
      const errorResponse: ErrorResponse = {
        error: 'Limit must be between 1 and 100',
        code: 'INVALID_PARAMETER',
        details: { parameter: 'limit', value: limit },
      };
      return res.status(400).json(errorResponse);
    }

    const result = await listSessions(page, limit);

    // Converter datas para ISO string
    const sessions = result.sessions.map((session) => ({
      id: session.id,
      title: session.title,
      type: session.type,
      openingDate: session.openingDate.toISOString(),
      legislature: session.legislature,
      legislativeSession: session.legislativeSession,
      url: session.url,
      detalhesColetados: session.detalhesColetados,
      scrapedAt: session.scrapedAt.toISOString(),
    }));

    const response = {
      sessions,
      pagination: result.pagination,
    };

    return res.json(response);
  } catch (error) {
    logger.error({ error }, 'Error listing sessions');
    const errorResponse: ErrorResponse = {
      error: 'Failed to list sessions',
      code: 'LIST_ERROR',
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return res.status(500).json(errorResponse);
  }
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, 'API server started');
    console.log(`🚀 API server running on http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  });
}

export { app };
