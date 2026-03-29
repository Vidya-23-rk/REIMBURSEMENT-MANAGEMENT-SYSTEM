import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { dashboardService } from './dashboard.service';
import { successResponse } from '../../utils/response';

export class DashboardController {
  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, role, companyId } = req.user!;

      let stats;
      switch (role) {
        case 'admin':
          stats = await dashboardService.getAdminStats(companyId);
          break;
        case 'manager':
          stats = await dashboardService.getManagerStats(userId, companyId);
          break;
        default:
          stats = await dashboardService.getEmployeeStats(userId);
          break;
      }

      successResponse(res, { role, ...stats });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
