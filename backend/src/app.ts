import express from 'express';
import cors from 'cors';
import path from 'path';
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

// ─── Global Middleware ──────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    },
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRouter);
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
