import prisma from '../../config/db';
import { hashPassword } from '../../utils/bcrypt';
import { AppError } from '../../middleware/errorHandler';

export class UsersService {
  async createUser(companyId: string, body: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'manager' | 'employee';
    managerId?: string;
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new AppError('Email already registered.', 409, 'DUPLICATE_EMAIL');
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        companyId,
        name: body.name,
        email: body.email,
        passwordHash,
        role: body.role,
        managerId: body.managerId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
    });

    return user;
  }

  async listUsers(companyId: string) {
    return prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateUser(userId: string, companyId: string, body: {
    role?: 'admin' | 'manager' | 'employee';
    managerId?: string | null;
    isManagerApprover?: boolean;
    name?: string;
  }) {
    // Verify user belongs to same company
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.role !== undefined && { role: body.role }),
        ...(body.managerId !== undefined && { managerId: body.managerId }),
        ...(body.isManagerApprover !== undefined && { isManagerApprover: body.isManagerApprover }),
        ...(body.name !== undefined && { name: body.name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        managerId: true,
        isManagerApprover: true,
        createdAt: true,
        manager: { select: { id: true, name: true } },
      },
    });
  }

  async deleteUser(userId: string, companyId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, companyId },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}

export const usersService = new UsersService();
