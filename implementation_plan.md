# RMS — 2-Person Work Split (Conflict-Free)

## 🔑 Core Principle: Directory-Level Ownership

```
reimbursement-app/
├── backend/          ← 🟦 PERSON A (100% ownership)
├── frontend/         ← 🟩 PERSON B (100% ownership)
├── .gitignore         ← 🟦 PERSON A creates (agreed template below)
└── README.md          ← 🟦 PERSON A creates (Person B adds frontend section later via PR)
```

> [!IMPORTANT]
> **Zero file overlap = Zero merge conflicts.** Person A NEVER touches `frontend/`. Person B NEVER touches `backend/`. Root-level files are owned by Person A only.

---

## 👤 Person A — Backend Developer

**Branch name:** `feat/backend`  
**Directory ownership:** `backend/`, root files  
**Tech:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Tesseract.js

### Hour 1 — Project Setup & Database

| # | Task | Files Created |
|---|------|--------------|
| 1 | Create root project structure | `.gitignore`, `README.md` |
| 2 | Init backend: `npm init -y`, install all deps | `backend/package.json` |
| 3 | Configure TypeScript | `backend/tsconfig.json` |
| 4 | Create `.env` with DATABASE_URL, JWT_SECRET, PORT | `backend/.env`, `backend/.env.example` |
| 5 | Setup Neon.tech PostgreSQL connection in `.env` | `backend/.env`, `backend/.env.example` |
| 6 | Write full Prisma schema (all 6 models) | `backend/prisma/schema.prisma` |
| 7 | Run migration: `npx prisma migrate dev --name init` | `backend/prisma/migrations/` |
| 8 | Write seed script | `backend/prisma/seed.ts` |
| 9 | Create Prisma client singleton | `backend/src/config/db.ts` |
| 10 | Create env validator | `backend/src/config/env.ts` |
| 11 | Create Express app + server entry | `backend/src/app.ts`, `backend/src/server.ts` |

**✅ Checkpoint:** `npm run dev` starts Express on port 4000. Neon.tech DB connected. `npx prisma studio` shows all tables.

### Hour 2 — Auth, Middleware & Users API

| # | Task | Files Created |
|---|------|--------------|
| 1 | JWT utilities | `backend/src/utils/jwt.ts` |
| 2 | Bcrypt utilities | `backend/src/utils/bcrypt.ts` |
| 3 | Response helpers | `backend/src/utils/response.ts` |
| 4 | Auth middleware (JWT guard) | `backend/src/middleware/authenticate.ts` |
| 5 | Role guard middleware | `backend/src/middleware/authorize.ts` |
| 6 | Global error handler | `backend/src/middleware/errorHandler.ts` |
| 7 | Multer upload config | `backend/src/middleware/upload.ts` |
| 8 | Auth module (signup + login) | `backend/src/modules/auth/auth.service.ts`, `auth.controller.ts`, `auth.router.ts` |
| 9 | Users module (CRUD) | `backend/src/modules/users/users.service.ts`, `users.controller.ts`, `users.router.ts` |

**✅ Checkpoint:** Can signup, login, get JWT. Admin can CRUD users via Postman/Thunder Client.

### Hour 3 — Expenses, Currency & OCR APIs

| # | Task | Files Created |
|---|------|--------------|
| 1 | Currency cache (in-memory, 1hr TTL) | `backend/src/modules/currency/currency.cache.ts` |
| 2 | Currency service (getRates, convert, getCurrencyList) | `backend/src/modules/currency/currency.service.ts` |
| 3 | Currency routes | `backend/src/modules/currency/currency.router.ts`, `currency.controller.ts` |
| 4 | OCR service (Tesseract.js) | `backend/src/modules/ocr/ocr.service.ts` |
| 5 | OCR routes (POST /ocr/scan) | `backend/src/modules/ocr/ocr.router.ts`, `ocr.controller.ts` |
| 6 | Expenses service (create with FX, list, filter) | `backend/src/modules/expenses/expenses.service.ts` |
| 7 | Expenses routes | `backend/src/modules/expenses/expenses.router.ts`, `expenses.controller.ts` |

**✅ Checkpoint:** Employee can submit expense. Currency converts. OCR extracts data from receipt image.

### Hour 4 — Approval Engine & Rules API

| # | Task | Files Created |
|---|------|--------------|
| 1 | Approval engine (core logic) | `backend/src/modules/approvals/approvals.engine.ts` |
| 2 | Approvals service | `backend/src/modules/approvals/approvals.service.ts` |
| 3 | Approvals routes | `backend/src/modules/approvals/approvals.router.ts`, `approvals.controller.ts` |
| 4 | Rules service (CRUD) | `backend/src/modules/rules/rules.service.ts` |
| 5 | Rules routes | `backend/src/modules/rules/rules.router.ts`, `rules.controller.ts` |

**✅ Checkpoint:** Full approval flow works end-to-end via API (test with Postman).

### Hour 5 — Testing & Hardening

| # | Task |
|---|------|
| 1 | Test all 20+ API endpoints via Postman/scripts |
| 2 | Test approval engine: percentage, specific, hybrid rule scenarios |
| 3 | Test edge cases: double-approve (409), no-permission (403), expired JWT (401) |
| 4 | Test admin override flow |
| 5 | Add input validation on all routes (body/param checks) |
| 6 | Write API documentation (routes, request/response examples) |

**✅ Checkpoint:** All APIs rock-solid. Documented. Ready for frontend integration.

---

## 👤 Person B — Frontend Developer

**Branch name:** `feat/frontend`  
**Directory ownership:** `frontend/`  
**Tech:** React 18, Vite, TailwindCSS v3, Zustand, Axios, React Router

### Hour 1 — Project Setup & Design System

| # | Task | Files Created |
|---|------|--------------|
| 1 | Scaffold: `npm create vite@latest frontend -- --template react-ts` | `frontend/` entire scaffold |
| 2 | Install deps: axios, zustand, react-router-dom | `frontend/package.json` |
| 3 | Setup TailwindCSS v3 | `frontend/tailwind.config.ts`, `frontend/postcss.config.js` |
| 4 | Configure Vite proxy to localhost:4000 | `frontend/vite.config.ts` |
| 5 | Create axios instance with interceptors | `frontend/src/api/axios.ts` |
| 6 | Create all TypeScript interfaces | `frontend/src/types/expense.ts`, `user.ts`, `approval.ts` |
| 7 | Create global CSS with TailwindCSS imports | `frontend/src/index.css` |

**✅ Checkpoint:** `npm run dev` starts React on port 5173. Axios configured. Types defined.

### Hour 2 — Auth Pages, Stores & Guards

| # | Task | Files Created |
|---|------|--------------|
| 1 | Auth Zustand store | `frontend/src/store/authStore.ts` |
| 2 | Expense Zustand store | `frontend/src/store/expenseStore.ts` |
| 3 | Auth API module | `frontend/src/api/auth.api.ts` |
| 4 | Login page (email + password form) | `frontend/src/pages/Login.tsx` |
| 5 | Signup page (name, email, password, company) | `frontend/src/pages/Signup.tsx` |
| 6 | ProtectedRoute component | `frontend/src/components/ProtectedRoute.tsx` |
| 7 | RoleGuard component | `frontend/src/components/RoleGuard.tsx` |
| 8 | Layout component (sidebar + topbar) | `frontend/src/components/Layout.tsx` |
| 9 | Router setup | `frontend/src/router.tsx` |
| 10 | App root (hydrate auth) | `frontend/src/App.tsx` |

**✅ Checkpoint:** Login/Signup pages render. Protected routes redirect. Layout with sidebar works. *(Can mock API responses for testing without backend)*

### Hour 3 — Employee Pages (Submit Expense, My Expenses, OCR)

| # | Task | Files Created |
|---|------|--------------|
| 1 | Expenses API module | `frontend/src/api/expenses.api.ts` |
| 2 | Currency API module | `frontend/src/api/currency.api.ts` |
| 3 | useAuth hook | `frontend/src/hooks/useAuth.ts` |
| 4 | useExpenses hook | `frontend/src/hooks/useExpenses.ts` |
| 5 | useCurrency hook | `frontend/src/hooks/useCurrency.ts` |
| 6 | CurrencyInput component | `frontend/src/components/CurrencyInput.tsx` |
| 7 | OCRUploader component | `frontend/src/components/OCRUploader.tsx` |
| 8 | StatusBadge component | `frontend/src/components/StatusBadge.tsx` |
| 9 | ExpenseCard component | `frontend/src/components/ExpenseCard.tsx` |
| 10 | ApprovalTimeline component | `frontend/src/components/ApprovalTimeline.tsx` |
| 11 | SubmitExpense page | `frontend/src/pages/employee/SubmitExpense.tsx` |
| 12 | MyExpenses page | `frontend/src/pages/employee/MyExpenses.tsx` |
| 13 | Employee Dashboard | `frontend/src/pages/employee/Dashboard.tsx` |

**✅ Checkpoint:** Employee can submit expense (form works), view history, OCR uploader functional.

### Hour 4 — Manager & Admin Pages

| # | Task | Files Created |
|---|------|--------------|
| 1 | Approvals API module | `frontend/src/api/approvals.api.ts` |
| 2 | Users API module | `frontend/src/api/users.api.ts` |
| 3 | PendingApprovals page (Manager) | `frontend/src/pages/manager/PendingApprovals.tsx` |
| 4 | Manager Dashboard | `frontend/src/pages/manager/Dashboard.tsx` |
| 5 | Admin Users page (CRUD table + modals) | `frontend/src/pages/admin/Users.tsx` |
| 6 | Admin ApprovalRules builder | `frontend/src/pages/admin/ApprovalRules.tsx` |
| 7 | Admin Dashboard (stats + override) | `frontend/src/pages/admin/Dashboard.tsx` |

**✅ Checkpoint:** All pages render. Manager can approve/reject. Admin can manage users/rules and override.

### Hour 5 — Polish & Responsive Design

| # | Task |
|---|------|
| 1 | Responsive sidebar (hamburger on mobile) |
| 2 | Animations on ApprovalTimeline (pulse on active step) |
| 3 | Toast notifications (success/error feedback) |
| 4 | Loading spinners / skeleton states |
| 5 | Form validation with error messages |
| 6 | Empty states (no expenses, no pending approvals) |
| 7 | Color theme consistency across all pages |
| 8 | Final cross-browser testing |

**✅ Checkpoint:** App looks polished and professional. All interactions smooth.

---

## 📋 Shared API Contract (AGREE BEFORE STARTING)

Both persons must agree on this **exact** API contract. Person A builds the APIs to match it. Person B builds the frontend to call it.

### Base URL: `http://localhost:4000/api`

```
AUTH (Public)
  POST /auth/signup     Body: { name, email, password, companyName }     → { token, user }
  POST /auth/login      Body: { email, password }                       → { token, user }

USERS (Admin only)
  GET    /users                                                         → User[]
  POST   /users         Body: { name, email, password, role, managerId? } → User
  PATCH  /users/:id     Body: { role?, managerId?, isManagerApprover? } → User
  DELETE /users/:id                                                     → { success: true }

EXPENSES
  POST /expenses        Body: { amount, currency, category, description, expenseDate } → Expense  [Employee]
  GET  /expenses/mine   Query: ?status=                                 → Expense[]                [Employee]
  GET  /expenses        Query: ?status&category&page&limit              → Expense[]                [Admin,Manager]
  GET  /expenses/:id                                                    → Expense (with approvals) [All roles]

APPROVALS
  GET  /approvals/pending                                               → ApprovalRequest[]  [Manager,Admin]
  POST /approvals/:id/approve    Body: { comment? }                     → { success: true }  [Manager,Admin]
  POST /approvals/:id/reject     Body: { comment }                      → { success: true }  [Manager,Admin]
  POST /approvals/override/:expenseId  Body: { action, comment }        → { success: true }  [Admin]

RULES (Admin only)
  GET    /rules                                                         → ApprovalRule[]
  POST   /rules         Body: { name, minAmount?, maxAmount?, ruleType, percentageThreshold?, steps[] }
  PATCH  /rules/:id     Body: same as create
  DELETE /rules/:id                                                     → { success: true }

OCR & CURRENCY
  POST /ocr/scan        Multipart: receipt (image)                      → { amount, currency, category, description, date, vendor }
  GET  /currency/list                                                   → { code, name, symbol }[]
  GET  /currency/rates  Query: ?base=INR                                → { rates: Record<string,number> }
```

### Response Format (Standard)
```typescript
// Success
{ success: true, data: <payload> }

// Error
{ success: false, error: string, code?: string }
```

### User Object Shape
```typescript
{
  id: string;           // UUID
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: string;
  managerId: string | null;
  isManagerApprover: boolean;
}
```

### Expense Object Shape
```typescript
{
  id: string;
  submittedBy: string;
  companyId: string;
  amount: number;
  currency: string;       // e.g. "USD"
  amountInBase: number;
  category: string;
  description: string;
  expenseDate: string;    // "YYYY-MM-DD"
  receiptUrl: string | null;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  createdAt: string;
  submitter?: { id: string; name: string; email: string; };
  approvalRequests?: ApprovalRequest[];
}
```

### ApprovalRequest Object Shape
```typescript
{
  id: string;
  expenseId: string;
  approverId: string;
  ruleId: string;
  stepOrder: number;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  decidedAt: string | null;
  approver?: { id: string; name: string; };
}
```

---

## 🔀 Git Workflow

### Initial Setup (One-time, by Person A)
```bash
git init
git remote add origin <github-repo-url>

# Create .gitignore at root FIRST
echo "node_modules/\n.env\ndist/\n.prisma/" > .gitignore

git add .gitignore
git commit -m "chore: initial gitignore"
git push -u origin main
```

> **Database setup:** Person A creates a free PostgreSQL database at [neon.tech](https://neon.tech) and shares the connection string with Person B for `.env.example`.

### Person A
```bash
git checkout -b feat/backend
# ... do all backend work ...
git add backend/ README.md .gitignore
git commit -m "feat: complete backend API"
git push origin feat/backend
# Create PR → merge to main
```

### Person B
```bash
git checkout -b feat/frontend
# ... do all frontend work ...
git add frontend/
git commit -m "feat: complete frontend UI"
git push origin feat/frontend
# Create PR → merge to main (AFTER Person A's PR is merged)
```

### Merge Order
```
1. Person A merges feat/backend → main     (no conflict — main is empty)
2. Person B merges feat/frontend → main    (no conflict — different directory)
```

> [!TIP]
> **Why zero conflicts?** Person A only creates/edits files in `backend/` and root. Person B only creates/edits files in `frontend/`. They never touch the same file.

---

## ⏰ Timeline (Parallel Work)

```
Time     Person A (Backend)              Person B (Frontend)
─────    ──────────────────              ───────────────────
Hr 1     Project setup + DB + Seed       Vite + TailwindCSS + Types + Axios
Hr 2     Auth + Middleware + Users API   Auth pages + Stores + Layout + Router
Hr 3     Expenses + Currency + OCR API   Employee pages + Components
Hr 4     Approval Engine + Rules API     Manager + Admin pages
Hr 5     API testing + Hardening         UI Polish + Responsive
Hr 6     ─────────── INTEGRATION TEST (both together) ───────────
```

> [!IMPORTANT]
> **Hour 6 is joint work.** Both merge branches, connect frontend to real backend, and run full E2E tests together.

---

## 🛡️ How Person B Works Without Backend

Person B can build **all frontend pages independently** using one of these methods:

### Option 1: Mock API responses (Recommended)
Create `frontend/src/api/mock.ts` with hardcoded responses:
```typescript
export const mockUser = { id: '1', name: 'John', email: 'john@test.com', role: 'employee' as const, ... };
export const mockExpenses = [ { id: '1', amount: 500, currency: 'USD', status: 'pending', ... } ];
```

### Option 2: MSW (Mock Service Worker)
Use `msw` library to intercept API calls and return mock data — zero backend needed.

### Option 3: JSON files
Store mock JSON in `frontend/src/mocks/` and import directly during development.

> Person B switches to real API calls during Hour 6 integration — this is just removing the mock and ensuring axios baseURL points to the real backend.
