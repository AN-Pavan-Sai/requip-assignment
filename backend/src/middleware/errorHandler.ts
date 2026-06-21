import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class.
 * Extends Error with an HTTP status code for consistent error handling.
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // Maintains proper stack trace in V8 engines (Node.js)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware.
 * Catches all errors thrown in route handlers and returns a consistent JSON response.
 *
 * - AppError instances use their own statusCode
 * - MySQL duplicate entry errors (ER_DUP_ENTRY) return 409 Conflict
 * - All other errors default to 500 Internal Server Error
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle MySQL duplicate entry errors
  if ((err as any).code === 'ER_DUP_ENTRY') {
    const message = parseDuplicateEntryMessage((err as any).message);
    res.status(409).json({
      success: false,
      message,
    });
    return;
  }

  // Fallback for unexpected errors
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}

/**
 * Parses MySQL duplicate entry error messages into user-friendly text.
 */
function parseDuplicateEntryMessage(errorMessage: string): string {
  if (errorMessage.includes('unique_email')) {
    return 'A user with this email already exists';
  }
  if (errorMessage.includes('unique_aadhaar')) {
    return 'A user with this Aadhaar number already exists';
  }
  if (errorMessage.includes('unique_pan')) {
    return 'A user with this PAN number already exists';
  }
  return 'A user with this information already exists';
}
