import prisma from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

export class CompanyService {
  async getCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new AppError('Company not found.', 404);
    return company;
  }

  async updateCompany(companyId: string, body: {
    name?: string;
    country?: string;
    currency?: string;
  }) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new AppError('Company not found.', 404);

    return prisma.company.update({
      where: { id: companyId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.country && { country: body.country }),
        ...(body.currency && { currency: body.currency }),
      },
    });
  }
}

export const companyService = new CompanyService();
