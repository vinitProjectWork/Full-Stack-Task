import type { Request, Response, NextFunction } from 'express';

/**
 * Logs every HTTP request with method, path, status code, and duration.
 * Attaches a `finish` listener so the log line is written after the
 * response has been sent — ensuring we capture the final status code.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const line = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    if (res.statusCode >= 400) {
      console.error(`[ERROR] ${line}`);
    } else {
      console.log(`[INFO]  ${line}`);
    }
  });

  next();
}
