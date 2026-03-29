import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { companyService } from './company.service';
import { successResponse } from '../../utils/response';

export class CompanyController {
  async getCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await companyService.getCompany(req.user!.companyId);
      successResponse(res, company);
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await companyService.updateCompany(req.user!.companyId, req.body);
      successResponse(res, company);
    } catch (error) {
      next(error);
    }
  }
}

export const companyController = new CompanyController();
