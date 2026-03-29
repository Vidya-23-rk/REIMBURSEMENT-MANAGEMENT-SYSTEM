import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { approvalsService } from './approvals.service';
import { successResponse, errorResponse } from '../../utils/response';

export class ApprovalsController {
  async getPendingApprovals(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const approvals = await approvalsService.getPendingApprovals(req.user!.userId);
      successResponse(res, approvals);
    } catch (error) {
      next(error);
    }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { comment } = req.body;
      const result = await approvalsService.approveRequest(id, req.user!.userId, comment);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { comment } = req.body;
      if (!comment) {
        errorResponse(res, 'Comment is required when rejecting.', 400);
        return;
      }
      const result = await approvalsService.rejectRequest(id, req.user!.userId, comment);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  async adminOverride(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const expenseId = req.params.expenseId as string;
      const { action, comment } = req.body;

      if (!action || !['approved', 'rejected'].includes(action)) {
        errorResponse(res, 'Action must be "approved" or "rejected".', 400);
        return;
      }
      if (!comment) {
        errorResponse(res, 'Comment is required for admin override.', 400);
        return;
      }

      const result = await approvalsService.adminOverride(expenseId, req.user!.userId, action, comment);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const approvalsController = new ApprovalsController();
