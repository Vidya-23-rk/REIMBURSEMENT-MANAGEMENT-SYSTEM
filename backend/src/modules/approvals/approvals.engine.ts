import prisma from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

/**
 * Core Approval Engine — handles rule matching, step initialization,
 * decision processing, and auto-resolution logic.
 */
export class ApprovalEngine {
  /**
   * Find matching approval rule for an expense amount
   */
  async findMatchingRule(companyId: string, amount: number) {
    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId,
        active: true,
      },
      include: {
        approvalSteps: {
          include: { approver: { select: { id: true, name: true, role: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { minAmount: 'asc' },
    });

    // Find rule where amount falls within range
    for (const rule of rules) {
      const min = rule.minAmount ? Number(rule.minAmount) : 0;
      const max = rule.maxAmount ? Number(rule.maxAmount) : Infinity;

      if (amount >= min && amount <= max) {
        return rule;
      }
    }

    // If no range match, return first active rule (default)
    return rules.length > 0 ? rules[0] : null;
  }

  /**
   * Initialize approval requests for an expense
   */
  async initializeApproval(expenseId: string, companyId: string, amount: number, submitterId: string) {
    const rule = await this.findMatchingRule(companyId, amount);
    if (!rule || rule.approvalSteps.length === 0) {
      // No rule — auto-approve
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'approved' },
      });
      return { autoApproved: true, rule: null };
    }

    // Check if submitter's manager is an approver (Step 0 pre-approval)
    const submitter = await prisma.user.findUnique({
      where: { id: submitterId },
      include: { manager: true },
    });

    let stepOffset = 0;
    const approvalRequests: any[] = [];

    // Manager pre-approval (Step 0) if isManagerApprover
    if (submitter?.manager?.isManagerApprover) {
      approvalRequests.push({
        expenseId,
        approverId: submitter.manager.id,
        ruleId: rule.id,
        stepOrder: 0,
        status: 'pending',
      });
      stepOffset = 0;
    }

    // Create approval requests for each step
    for (const step of rule.approvalSteps) {
      let resolvedApproverId = step.approverId;

      if ((step as any).approverType === 'manager') {
        if (submitter?.managerId) {
          resolvedApproverId = submitter.managerId;
        } else {
          continue; // Cannot process manager step if user has no manager
        }
      }

      if (!resolvedApproverId) continue;

      // Skip if approver is the submitter
      if (resolvedApproverId === submitterId) continue;

      approvalRequests.push({
        expenseId,
        approverId: resolvedApproverId,
        ruleId: rule.id,
        stepOrder: step.stepOrder,
        status: 'pending',
      });
    }

    if (approvalRequests.length === 0) {
      // All approvers are the submitter — auto-approve
      await prisma.expense.update({
        where: { id: expenseId },
        data: { status: 'approved' },
      });
      return { autoApproved: true, rule };
    }

    // Create all approval requests
    await prisma.approvalRequest.createMany({ data: approvalRequests });

    // Update expense status to in_progress
    await prisma.expense.update({
      where: { id: expenseId },
      data: { status: 'in_progress' },
    });

    return { autoApproved: false, rule, stepsCreated: approvalRequests.length };
  }

  /**
   * Process an approval/rejection decision
   */
  async processDecision(
    approvalRequestId: string,
    approverId: string,
    action: 'approved' | 'rejected',
    comment?: string
  ) {
    const request = await prisma.approvalRequest.findUnique({
      where: { id: approvalRequestId },
      include: {
        expense: true,
        rule: {
          include: {
            approvalSteps: { orderBy: { stepOrder: 'asc' } },
          },
        },
      },
    });

    if (!request) throw new AppError('Approval request not found.', 404);
    if (request.approverId !== approverId) throw new AppError('Not authorized to approve this request.', 403);
    if (request.status !== 'pending') throw new AppError('This request has already been decided.', 409, 'ALREADY_DECIDED');

    // Update the approval request
    await prisma.approvalRequest.update({
      where: { id: approvalRequestId },
      data: {
        status: action,
        comment: comment || null,
        decidedAt: new Date(),
      },
    });

    // If rejected, immediately reject the expense
    if (action === 'rejected') {
      await prisma.expense.update({
        where: { id: request.expenseId },
        data: { status: 'rejected' },
      });
      return { decision: 'rejected', expenseStatus: 'rejected' };
    }

    // If approved, check if expense should be auto-approved based on rule type
    return this.evaluateExpenseStatus(request.expenseId, request.rule);
  }

  /**
   * Evaluate if an expense should be approved based on rule type
   */
  private async evaluateExpenseStatus(expenseId: string, rule: any) {
    const allRequests = await prisma.approvalRequest.findMany({
      where: { expenseId },
      include: {
        approver: { select: { id: true, name: true } },
      },
      orderBy: { stepOrder: 'asc' },
    });

    const totalApprovers = allRequests.length;
    const approvedCount = allRequests.filter((r: any) => r.status === 'approved').length;
    const pendingCount = allRequests.filter((r: any) => r.status === 'pending').length;

    const ruleType = rule.ruleType;

    switch (ruleType) {
      case 'none': {
        // ALL must approve
        if (approvedCount === totalApprovers) {
          await prisma.expense.update({ where: { id: expenseId }, data: { status: 'approved' } });
          return { decision: 'approved', expenseStatus: 'approved' };
        }
        return { decision: 'approved', expenseStatus: 'in_progress', remaining: pendingCount };
      }

      case 'percentage': {
        const threshold = rule.percentageThreshold || 50;
        const percentage = (approvedCount / totalApprovers) * 100;
        if (percentage >= threshold) {
          await prisma.expense.update({ where: { id: expenseId }, data: { status: 'approved' } });
          return { decision: 'approved', expenseStatus: 'approved' };
        }
        return { decision: 'approved', expenseStatus: 'in_progress', remaining: pendingCount };
      }

      case 'specific': {
        // Check if specific key approver has approved
        const steps = await prisma.approvalStep.findMany({
          where: { ruleId: rule.id, isKeyApprover: true },
        });
        const keyApproverIds = steps.map((s: any) => s.approverId);
        const keyApproved = allRequests.some(
          (r: any) => keyApproverIds.includes(r.approverId) && r.status === 'approved'
        );
        if (keyApproved) {
          await prisma.expense.update({ where: { id: expenseId }, data: { status: 'approved' } });
          return { decision: 'approved', expenseStatus: 'approved' };
        }
        return { decision: 'approved', expenseStatus: 'in_progress', remaining: pendingCount };
      }

      case 'hybrid': {
        // Check percentage OR key approver
        const threshold = rule.percentageThreshold || 50;
        const percentage = (approvedCount / totalApprovers) * 100;
        if (percentage >= threshold) {
          await prisma.expense.update({ where: { id: expenseId }, data: { status: 'approved' } });
          return { decision: 'approved', expenseStatus: 'approved' };
        }

        const hybridSteps = await prisma.approvalStep.findMany({
          where: { ruleId: rule.id, isKeyApprover: true },
        });
        const hybridKeyIds = hybridSteps.map((s: any) => s.approverId);
        const hybridKeyApproved = allRequests.some(
          (r: any) => hybridKeyIds.includes(r.approverId) && r.status === 'approved'
        );
        if (hybridKeyApproved) {
          await prisma.expense.update({ where: { id: expenseId }, data: { status: 'approved' } });
          return { decision: 'approved', expenseStatus: 'approved' };
        }

        return { decision: 'approved', expenseStatus: 'in_progress', remaining: pendingCount };
      }

      default:
        return { decision: 'approved', expenseStatus: 'in_progress', remaining: pendingCount };
    }
  }

  /**
   * Admin override — approve or reject an expense bypassing all rules
   */
  async adminOverride(expenseId: string, adminId: string, action: 'approved' | 'rejected', comment: string) {
    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) throw new AppError('Expense not found.', 404);

    // Update all pending approval requests
    await prisma.approvalRequest.updateMany({
      where: { expenseId, status: 'pending' },
      data: {
        status: action,
        comment: `[ADMIN OVERRIDE] ${comment}`,
        decidedAt: new Date(),
      },
    });

    // Update expense status
    await prisma.expense.update({
      where: { id: expenseId },
      data: { status: action },
    });

    return { success: true, action, overrideBy: adminId };
  }
}

export const approvalEngine = new ApprovalEngine();
