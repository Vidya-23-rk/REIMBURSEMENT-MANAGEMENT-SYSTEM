import prisma from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

export class RulesService {
  async listRules(companyId: string) {
    return prisma.approvalRule.findMany({
      where: { companyId },
      include: {
        approvalSteps: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(companyId: string, body: {
    name: string;
    minAmount?: number;
    maxAmount?: number;
    ruleType: 'none' | 'percentage' | 'specific' | 'hybrid';
    percentageThreshold?: number;
    steps: { approverId?: string | null; approverType?: string; stepOrder: number; isKeyApprover?: boolean }[];
  }) {
    const rule = await prisma.approvalRule.create({
      data: {
        companyId,
        name: body.name,
        minAmount: body.minAmount || null,
        maxAmount: body.maxAmount || null,
        ruleType: body.ruleType,
        percentageThreshold: body.percentageThreshold || null,
        approvalSteps: {
          create: body.steps.map(step => ({
            approverId: step.approverId || null,
            approverType: step.approverType || 'specific',
            stepOrder: step.stepOrder,
            isKeyApprover: step.isKeyApprover || false,
          })),
        },
      },
      include: {
        approvalSteps: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return rule;
  }

  async updateRule(ruleId: string, companyId: string, body: {
    name?: string;
    minAmount?: number | null;
    maxAmount?: number | null;
    ruleType?: 'none' | 'percentage' | 'specific' | 'hybrid';
    percentageThreshold?: number | null;
    active?: boolean;
    steps?: { approverId?: string | null; approverType?: string; stepOrder: number; isKeyApprover?: boolean }[];
  }) {
    const existing = await prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId },
    });
    if (!existing) throw new AppError('Rule not found.', 404);

    // If steps are provided, delete old and create new (transactional)
    if (body.steps) {
      await prisma.$transaction(async (tx: any) => {
        await tx.approvalStep.deleteMany({ where: { ruleId } });
        await tx.approvalStep.createMany({
          data: body.steps!.map(step => ({
            ruleId,
            approverId: step.approverId || null,
            approverType: step.approverType || 'specific',
            stepOrder: step.stepOrder,
            isKeyApprover: step.isKeyApprover || false,
          })),
        });
      });
    }

    const rule = await prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.minAmount !== undefined && { minAmount: body.minAmount }),
        ...(body.maxAmount !== undefined && { maxAmount: body.maxAmount }),
        ...(body.ruleType !== undefined && { ruleType: body.ruleType }),
        ...(body.percentageThreshold !== undefined && { percentageThreshold: body.percentageThreshold }),
        ...(body.active !== undefined && { active: body.active }),
      },
      include: {
        approvalSteps: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    return rule;
  }

  async deleteRule(ruleId: string, companyId: string) {
    const existing = await prisma.approvalRule.findFirst({
      where: { id: ruleId, companyId },
    });
    if (!existing) throw new AppError('Rule not found.', 404);

    await prisma.approvalRule.delete({ where: { id: ruleId } });
    return { success: true };
  }
}

export const rulesService = new RulesService();
