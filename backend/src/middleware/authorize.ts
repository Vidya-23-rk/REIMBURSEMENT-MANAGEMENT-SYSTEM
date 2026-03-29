import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { errorResponse } from '../utils/response';

export function authorize(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(res, 'Access denied. Insufficient permissions.', 403);
      return;
    }

    next();
  };
}
