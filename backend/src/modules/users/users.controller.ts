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
      const { name, email, password, role, managerId } = req.body;

      if (!name || !email || !password || !role) {
        res.status(400).json({ success: false, error: 'Name, email, password, and role are required.' });
        return;
      }

      if (!['admin', 'manager', 'employee'].includes(role)) {
        res.status(400).json({ success: false, error: 'Role must be admin, manager, or employee.' });
        return;
      }

      const user = await usersService.createUser(req.user!.companyId, {
        name, email, password, role, managerId,
      });
      successResponse(res, user, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const user = await usersService.updateUser(id, req.user!.companyId, req.body);
      successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await usersService.deleteUser(id, req.user!.companyId);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
