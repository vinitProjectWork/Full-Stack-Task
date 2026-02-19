import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { getActiveLocations } from '../services/location.service.js';

const router = Router();

/**
 * GET /api/locations
 * Returns all active Square locations in a simplified format.
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const locations = await getActiveLocations();
    res.json({ locations });
  } catch (err) {
    next(err);
  }
});

export default router;
