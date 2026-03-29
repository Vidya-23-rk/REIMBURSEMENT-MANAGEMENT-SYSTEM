import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Express middleware factory for Zod validation.
 * Validates req.body against the given schema.
 */
export function validate(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.issues.map(
        (e: any) => `${e.path.join('.')}: ${e.message}`
      );
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: messages,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
