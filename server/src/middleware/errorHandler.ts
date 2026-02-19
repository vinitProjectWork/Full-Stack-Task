import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import type { ApiErrorResponse } from '../types/api.types.js';

/**
 * Global Express error handler.
 * Converts known `AppError` instances into structured JSON responses.
 * Unknown errors are logged and return a generic 500 response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiErrorResponse>,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
    return;
  }

  // Unexpected / unhandled error
  console.error('[UNHANDLED]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
