import { Request, Response, NextFunction } from 'express';
import { currencyService } from './currency.service';
import { successResponse } from '../../utils/response';

export class CurrencyController {
  async getRates(req: Request, res: Response, next: NextFunction) {
    try {
      const base = (req.query.base as string) || 'USD';
      const rates = await currencyService.getRates(base);
      successResponse(res, { base, rates });
    } catch (error) {
      next(error);
    }
  }

  async getCurrencyList(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await currencyService.getCurrencyList();
      successResponse(res, list);
    } catch (error) {
      next(error);
    }
  }
}

export const currencyController = new CurrencyController();
