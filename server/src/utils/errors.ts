/**
 * Custom error classes for structured error handling.
 * Each error carries a status code and machine-readable code so the
 * global error handler can build a consistent API error response.
 */

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, 'BAD_REQUEST', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class SquareApiError extends AppError {
  constructor(statusCode: number, message: string, details?: string) {
    super(statusCode, 'SQUARE_API_ERROR', message, details);
  }
}
