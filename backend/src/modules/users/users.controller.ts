import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { usersService } from './users.service';
import { successResponse } from '../../utils/response';

export class UsersController {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await usersService.listUsers(req.user!.companyId);
      successResponse(res, users);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Zod already validated req.body
      const user = await usersService.createUser(req.user!.companyId, req.body);
      successResponse(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await usersService.updateUser(req.params.id, req.user!.companyId, req.body);
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await usersService.deleteUser(req.params.id, req.user!.companyId);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
