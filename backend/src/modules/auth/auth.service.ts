import prisma from '../../config/db';
import { hashPassword, comparePassword } from '../../utils/bcrypt';
import { signToken } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';

export class AuthService {
  async signup(body: {
    name: string;
    email: string;
    password: string;
    companyName: string;
    country?: string;
    currency?: string;
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    if (existingUser) {
      throw new AppError('Email already registered.', 409, 'DUPLICATE_EMAIL');
    }

    const passwordHash = await hashPassword(body.password);

    const result = await prisma.$transaction(async (tx: any) => {
      const company = await tx.company.create({
        data: {
          name: body.companyName,
          country: body.country || 'India',
          currency: body.currency || 'INR',
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name: body.name,
          email: body.email,
          passwordHash,
          role: 'admin',
        },
      });

      return { company, user };
    });

    const token = signToken({
      userId: result.user.id,
      role: result.user.role,
      companyId: result.company.id,
    });

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        companyId: result.company.id,
        isManagerApprover: result.user.isManagerApprover,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      companyId: user.companyId,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        managerId: user.managerId,
        isManagerApprover: user.isManagerApprover,
      },
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: { select: { id: true, name: true, currency: true, country: true } },
        manager: { select: { id: true, name: true } },
      },
    });

    if (!user) throw new AppError('User not found.', 404);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      managerId: user.managerId,
      isManagerApprover: user.isManagerApprover,
      company: user.company,
      manager: user.manager,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404);

    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 401);
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { success: true, message: 'Password changed successfully.' };
  }
}

export const authService = new AuthService();
