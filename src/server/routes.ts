import { Router } from 'express';
import { listSessions } from '../pipelines/sessions/sessions.repository.js';
import { scrapeSessionOnDemand } from '../api/on-demand.js';
import { fetchOrderOfDay } from '../pipelines/sessions/sessions.order.fetcher.js';
import { upsertOrderOfDay, getOrderOfDay } from '../pipelines/sessions/sessions.order.repository.js';
import { fetchAttendance } from '../pipelines/sessions/sessions.attendance.fetcher.js';
import { upsertAttendance, getAttendance } from '../pipelines/sessions/sessions.attendance.repository.js';
import type { DetailStatus } from '../shared/types/index.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'camara-radar-api'
  });
});

router.get('/sessions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as DetailStatus | undefined;
    
    const sessions = await listSessions({ limit, offset, status });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    if (isNaN(sessionId)) {
      res.status(400).json({ error: 'Invalid session ID' });
      return;
    }

    const session = await scrapeSessionOnDemand(sessionId);
    res.json(session);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch session details';
    
    if (errorMessage.includes('not found')) {
      res.status(404).json({ error: errorMessage });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
});

router.get('/sessions/:sessionId/ordem-dia', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      res.status(400).json({ error: 'Invalid session ID' });
      return;
    }

    // Ensure session exists in DB
    await scrapeSessionOnDemand(sessionId);

    // Try to get from DB first
    let items = await getOrderOfDay(sessionId);
    
    const forceRefresh = req.query.refresh === 'true';
    // Check if items are missing the new fields (ementa)
    // We check if any item has null ementa, assuming that if one is missing, we should refresh.
    // Note: Some items might genuinely not have ementa, but usually they do.
    // To be safe, we can check if ALL items have null ementa, or just rely on forceRefresh.
    // But the user is complaining about nulls, so let's auto-refresh if ementa is missing.
    const hasMissingDetails = items && items.length > 0 && items.some((i: any) => i.ementa === null || i.ementa === undefined);

    // If empty, missing details, or forced, fetch from API and save
    if (!items || items.length === 0 || hasMissingDetails || forceRefresh) {
      const fetchedItems = await fetchOrderOfDay(sessionId);
      await upsertOrderOfDay(sessionId, fetchedItems);
      items = await getOrderOfDay(sessionId);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch order of day' });
  }
});

router.get('/sessions/:sessionId/presenca', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      res.status(400).json({ error: 'Invalid session ID' });
      return;
    }

    // Ensure session exists in DB
    await scrapeSessionOnDemand(sessionId);

    // Try to get from DB first
    let items = await getAttendance(sessionId);
    
    // If empty, fetch from API and save
    if (!items || items.length === 0) {
      const fetchedItems = await fetchAttendance(sessionId);
      await upsertAttendance(sessionId, fetchedItems);
      items = await getAttendance(sessionId);
    }

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch attendance' });
  }
});

export { router };
