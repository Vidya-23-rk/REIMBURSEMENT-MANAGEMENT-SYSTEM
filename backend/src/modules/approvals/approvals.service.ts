import prisma from '../../config/db';
import { approvalEngine } from './approvals.engine';
import { AppError } from '../../middleware/errorHandler';

export class ApprovalsService {
  async getPendingApprovals(approverId: string) {
    return prisma.approvalRequest.findMany({
      where: {
        approverId,
        status: 'pending',
      },
      include: {
        expense: {
          include: {
            submitter: { select: { id: true, name: true, email: true } },
          },
        },
        rule: { select: { id: true, name: true, ruleType: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async approveRequest(approvalRequestId: string, approverId: string, comment?: string) {
    return approvalEngine.processDecision(approvalRequestId, approverId, 'approved', comment);
  }

  async rejectRequest(approvalRequestId: string, approverId: string, comment: string) {
    if (!comment) throw new AppError('Comment is required when rejecting.', 400);
    return approvalEngine.processDecision(approvalRequestId, approverId, 'rejected', comment);
  }

  async adminOverride(expenseId: string, adminId: string, action: 'approved' | 'rejected', comment: string) {
    if (!comment) throw new AppError('Comment is required for admin override.', 400);
    return approvalEngine.adminOverride(expenseId, adminId, action, comment);
  }
}

export const approvalsService = new ApprovalsService();
