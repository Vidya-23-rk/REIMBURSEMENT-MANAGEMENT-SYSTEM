import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/authenticate';
import { rulesService } from './rules.service';
import { successResponse, errorResponse } from '../../utils/response';

export class RulesController {
  async listRules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const rules = await rulesService.listRules(req.user!.companyId);
      successResponse(res, rules);
    } catch (error) {
      next(error);
    }
  }

  async createRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, minAmount, maxAmount, ruleType, percentageThreshold, steps } = req.body;

      if (!name || !ruleType || !steps || !Array.isArray(steps) || steps.length === 0) {
        errorResponse(res, 'Name, ruleType, and at least one step are required.', 400);
        return;
      }

      const rule = await rulesService.createRule(req.user!.companyId, {
        name, minAmount, maxAmount, ruleType, percentageThreshold, steps,
      });
      successResponse(res, rule, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ruleId = req.params.id as string;
      const rule = await rulesService.updateRule(ruleId, req.user!.companyId, req.body);
      successResponse(res, rule);
    } catch (error) {
      next(error);
    }
  }

  async deleteRule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const ruleId = req.params.id as string;
      const result = await rulesService.deleteRule(ruleId, req.user!.companyId);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const rulesController = new RulesController();
