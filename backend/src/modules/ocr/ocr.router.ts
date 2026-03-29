import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { upload } from '../../middleware/upload';
import { ocrController } from './ocr.controller';

const router = Router();

router.use(authenticate);

router.post('/scan', upload.single('receipt'), (req, res, next) => ocrController.scan(req, res, next));

export default router;
