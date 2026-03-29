# Reimbursement Management System (RMS)

A full-stack web application that replaces manual, error-prone expense workflows with a structured, configurable, and fully auditable digital system.

## Features

- **Multi-role system** — Admin, Manager, Employee with role-based access control
- **Flexible approval chains** — Sequential multi-step approvals with conditional rules (percentage, key-approver, hybrid)
- **AI-powered OCR** — Receipt scanning with automatic field extraction
- **Real-time currency conversion** — Submit expenses in any currency with live FX rates
- **Admin override** — Bypass approval flows with full audit trail

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Database | Prisma ORM + PostgreSQL (Neon.tech) |
| Frontend | React 18 + Vite + TailwindCSS v3 + Zustand |
| OCR | Tesseract.js |
| FX Rates | ExchangeRate API |

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Update DATABASE_URL in .env with your Neon.tech connection string
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

See [backend API reference](/backend/README.md) for full endpoint documentation.
