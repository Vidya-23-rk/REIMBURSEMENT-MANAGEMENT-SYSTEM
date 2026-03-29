import { Request, Response, NextFunction } from 'express';
import { ocrService } from './ocr.service';
import { successResponse, errorResponse } from '../../utils/response';

export class OcrController {
  async scan(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        errorResponse(res, 'Receipt image is required.', 400);
        return;
      }

      const result = await ocrService.scanReceipt(req.file.buffer);
      successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const ocrController = new OcrController();
