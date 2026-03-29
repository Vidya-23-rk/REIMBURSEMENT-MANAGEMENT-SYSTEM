import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(`❌ [${new Date().toISOString()}] ${err.name}: ${err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  // Prisma known errors
  if ((err as any).code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this value already exists.',
      code: 'DUPLICATE',
    });
    return;
  }

  if ((err as any).code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Record not found.',
      code: 'NOT_FOUND',
    });
    return;
  }

  // Default 500
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    success: false,
    error: message,
  });
}
