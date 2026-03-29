import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { signupSchema, loginSchema, changePasswordSchema } from '../../utils/validators';
import { authController } from './auth.controller';

const router = Router();

// Public routes — with Zod validation
router.post('/signup', validate(signupSchema), (req, res, next) => authController.signup(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

// Protected routes
router.get('/me', authenticate, (req, res, next) => authController.getMe(req as any, res, next));
router.patch('/password', authenticate, validate(changePasswordSchema), (req, res, next) => authController.changePassword(req as any, res, next));

export default router;
