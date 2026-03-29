import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    companyId: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Access denied. No token provided.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    errorResponse(res, 'Invalid or expired token.', 401);
    return;
  }
}
