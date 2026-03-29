import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { currencyController } from './currency.controller';

const router = Router();

router.use(authenticate);

router.get('/rates', (req, res, next) => currencyController.getRates(req, res, next));
router.get('/list', (req, res, next) => currencyController.getCurrencyList(req, res, next));

export default router;
