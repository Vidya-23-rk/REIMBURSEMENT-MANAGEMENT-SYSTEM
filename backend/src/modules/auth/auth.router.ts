import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authController } from './auth.controller';

const router = Router();

// Public routes
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Protected route — get current user from JWT
router.get('/me', authenticate, (req, res, next) => authController.getMe(req as any, res, next));

export default router;
