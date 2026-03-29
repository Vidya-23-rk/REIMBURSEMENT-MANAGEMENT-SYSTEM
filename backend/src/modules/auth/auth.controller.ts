import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/authenticate';
import { successResponse } from '../../utils/response';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, companyName, country, currency } = req.body;

      if (!name || !email || !password || !companyName) {
        res.status(400).json({ success: false, error: 'Name, email, password, and companyName are required.' });
        return;
      }

      const result = await authService.signup({ name, email, password, companyName, country, currency });
      successResponse(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const result = await authService.login(email, password);
      successResponse(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId);
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
