import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import {
  getCatalogByLocation,
  getCategoriesByLocation,
} from '../services/catalog.service.js';

const router = Router();

/**
 * GET /api/catalog?location_id=<ID>&page=<n>&limit=<n>&q=<search>&category=<ID>
 * Returns paginated menu items grouped by category for the given location.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationId = req.query.location_id as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 6;
    const q = (req.query.q as string) || '';
    const category = (req.query.category as string) || '';

    const catalog = await getCatalogByLocation({ locationId, page, limit, q, category: category || undefined });
    res.json(catalog);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/catalog/categories?location_id=<ID>
 * Returns categories with item counts for the given location.
 */
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const locationId = req.query.location_id as string;
    const categories = await getCategoriesByLocation(locationId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

export default router;
