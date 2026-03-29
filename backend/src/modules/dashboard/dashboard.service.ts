import prisma from '../../config/db';

export class DashboardService {
  /**
   * Admin dashboard — company-wide stats
   */
  async getAdminStats(companyId: string) {
    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      totalUsers,
      pendingApprovals,
    ] = await Promise.all([
      prisma.expense.count({ where: { companyId } }),
      prisma.expense.count({ where: { companyId, status: 'pending' } }),
      prisma.expense.count({ where: { companyId, status: 'approved' } }),
      prisma.expense.count({ where: { companyId, status: 'rejected' } }),
      prisma.user.count({ where: { companyId } }),
      prisma.approvalRequest.count({
        where: { expense: { companyId }, status: 'pending' },
      }),
    ]);

    const approvedAmounts = await prisma.expense.aggregate({
      where: { companyId, status: 'approved' },
      _sum: { amountInBase: true },
    });

    const pendingAmounts = await prisma.expense.aggregate({
      where: { companyId, status: { in: ['pending', 'in_progress'] } },
      _sum: { amountInBase: true },
    });

    // Recent expenses (last 5)
    const recentExpenses = await prisma.expense.findMany({
      where: { companyId },
      include: { submitter: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['category'],
      where: { companyId },
      _count: true,
      _sum: { amountInBase: true },
    });

    return {
      overview: {
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        inProgressExpenses: totalExpenses - pendingExpenses - approvedExpenses - rejectedExpenses,
        totalUsers,
        pendingApprovals,
        totalApprovedAmount: Number(approvedAmounts._sum.amountInBase || 0),
        totalPendingAmount: Number(pendingAmounts._sum.amountInBase || 0),
      },
      recentExpenses,
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c.category,
        count: c._count,
        totalAmount: Number(c._sum.amountInBase || 0),
      })),
    };
  }

  /**
   * Manager dashboard — team stats + pending approvals
   */
  async getManagerStats(userId: string, companyId: string) {
    const [
      myPendingApprovals,
      myCompletedApprovals,
      teamMembers,
    ] = await Promise.all([
      prisma.approvalRequest.count({ where: { approverId: userId, status: 'pending' } }),
      prisma.approvalRequest.count({ where: { approverId: userId, status: { in: ['approved', 'rejected'] } } }),
      prisma.user.count({ where: { managerId: userId } }),
    ]);

    // Pending approvals with details
    const pendingApprovalDetails = await prisma.approvalRequest.findMany({
      where: { approverId: userId, status: 'pending' },
      include: {
        expense: {
          include: { submitter: { select: { id: true, name: true } } },
        },
        rule: { select: { name: true, ruleType: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    return {
      overview: {
        pendingApprovals: myPendingApprovals,
        completedApprovals: myCompletedApprovals,
        teamMembers,
      },
      pendingApprovalDetails,
    };
  }

  /**
   * Employee dashboard — personal expense stats
   */
  async getEmployeeStats(userId: string) {
    const [
      totalSubmitted,
      pending,
      approved,
      rejected,
    ] = await Promise.all([
      prisma.expense.count({ where: { submittedBy: userId } }),
      prisma.expense.count({ where: { submittedBy: userId, status: { in: ['pending', 'in_progress'] } } }),
      prisma.expense.count({ where: { submittedBy: userId, status: 'approved' } }),
      prisma.expense.count({ where: { submittedBy: userId, status: 'rejected' } }),
    ]);

    const approvedAmount = await prisma.expense.aggregate({
      where: { submittedBy: userId, status: 'approved' },
      _sum: { amountInBase: true },
    });

    const recentExpenses = await prisma.expense.findMany({
      where: { submittedBy: userId },
      include: {
        approvalRequests: {
          include: { approver: { select: { id: true, name: true } } },
          orderBy: { stepOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      overview: {
        totalSubmitted,
        pending,
        approved,
        rejected,
        totalApprovedAmount: Number(approvedAmount._sum.amountInBase || 0),
      },
      recentExpenses,
    };
  }
}

export const dashboardService = new DashboardService();
