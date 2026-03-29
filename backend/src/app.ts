import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import expensesRouter from './modules/expenses/expenses.router';
import approvalsRouter from './modules/approvals/approvals.router';
import rulesRouter from './modules/rules/rules.router';
import ocrRouter from './modules/ocr/ocr.router';
import currencyRouter from './modules/currency/currency.router';
import dashboardRouter from './modules/dashboard/dashboard.router';

const app = express();

// ─── Security Middleware ────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ─── Rate Limiting ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Try again later.' },
});
app.use(globalLimiter);

// Stricter limiter for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                    // 20 login attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' },
});

// ─── CORS ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
}));

// ─── Body Parsers ───────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static File Serving (uploads) ─────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users', usersRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/approvals', approvalsRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/currency', currencyRouter);
app.use('/api/dashboard', dashboardRouter);

// ─── 404 Handler ────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ─── Global Error Handler ───────────────────────────────
app.use(errorHandler);

export default app;
