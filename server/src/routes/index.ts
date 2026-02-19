import { Router } from 'express';
import locationsRouter from './locations.routes.js';
import catalogRouter from './catalog.routes.js';

const router = Router();

router.use('/locations', locationsRouter);
router.use('/catalog', catalogRouter);

/** Simple health-check endpoint for monitoring / readiness probes. */
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
