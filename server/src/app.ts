import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

/**
 * Creates and configures the Express application.
 * Exported as a factory so tests can create isolated instances.
 */
export function createApp(): express.Express {
  const app = express();

  // --------------- Middleware ---------------
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(requestLogger);

  // --------------- Routes ------------------
  app.use('/api', apiRouter);

  // --------------- Error handling -----------
  app.use(errorHandler);

  return app;
}
