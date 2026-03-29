# Backend API Handoff — For Frontend Developer (Person B)

## Quick Start

```bash
# 1. Clone and switch to backend branch
git clone https://github.com/Vidya-23-rk/REIMBURSEMENT-MANAGEMENT-SYSTEM.git
cd REIMBURSEMENT-MANAGEMENT-SYSTEM

# 2. Setup backend (for local testing)
cd backend
cp .env.example .env    # Then fill in real DATABASE_URL and JWT_SECRET
npm install
npx prisma db push
npm run seed
npm run dev             # Runs on http://localhost:4000
```

## Base URL
```
http://localhost:4000/api
```

## Auth Header Format
```
Authorization: Bearer <jwt_token>
```

---

## Test Credentials (Seeded Data)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@techcorp.com | admin123 |
| **Manager** | priya@techcorp.com | manager123 |
| **Finance Manager** | rahul@techcorp.com | finance123 |
| **Director** | anita@techcorp.com | director123 |
| **Employee** | amit@techcorp.com | employee123 |
| **Employee** | sneha@techcorp.com | employee123 |

---

## All Endpoints

### 🔓 Auth (Public)

#### `POST /api/auth/signup`
```json
// Request
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "password123",
  "companyName": "My Company",
  "country": "India",     // optional, defaults to "India"
  "currency": "INR"       // optional, defaults to "INR"
}

// Response (201)
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": { "id", "name", "email", "role": "admin", "companyId", "isManagerApprover" }
  }
}
```

#### `POST /api/auth/login`
```json
// Request
{ "email": "admin@techcorp.com", "password": "admin123" }

// Response (200)
{
  "success": true,
  "data": {
    "token": "eyJhbG...",
    "user": { "id", "name", "email", "role", "companyId", "managerId", "isManagerApprover" }
  }
}
```

#### `GET /api/auth/me` 🔒
```json
// Response (200)
{
  "success": true,
  "data": {
    "id", "name", "email", "role", "companyId", "managerId", "isManagerApprover",
    "company": { "id", "name", "currency", "country" },
    "manager": { "id", "name" }   // null if no manager
  }
}
```

---

### 👥 Users (Admin Only) 🔒

#### `GET /api/users`
Returns array of all company users.

#### `POST /api/users`
```json
{
  "name": "New User",
  "email": "new@company.com",
  "password": "pass123",
  "role": "employee",       // "admin" | "manager" | "employee"
  "managerId": "uuid"       // optional
}
```

#### `PATCH /api/users/:id`
```json
{ "role": "manager", "managerId": "uuid", "isManagerApprover": true, "name": "Updated" }
```

#### `DELETE /api/users/:id`

---

### 💰 Expenses 🔒

#### `POST /api/expenses` (multipart/form-data)
```
Fields:
  amount: 2500
  currency: "USD"
  category: "travel"
  description: "Flight to Mumbai"
  expenseDate: "2025-03-28"
  receipt: [image file]    // optional, saves to /uploads/
```
Response includes expense + `approvalResult` (auto-triggers approval flow).

#### `GET /api/expenses/mine?status=pending`
My expenses (any role). Filter by status: `pending`, `in_progress`, `approved`, `rejected`.

#### `GET /api/expenses?status=&category=&page=1&limit=20` (Admin/Manager)
All company expenses with pagination.

#### `GET /api/expenses/:id`
Single expense with approval request details.

---

### ✅ Approvals (Admin/Manager) 🔒

#### `GET /api/approvals/pending`
Pending approval requests assigned to the current user.

#### `POST /api/approvals/:id/approve`
```json
{ "comment": "Looks good" }     // comment optional
```

#### `POST /api/approvals/:id/reject`
```json
{ "comment": "Missing receipt" }  // comment REQUIRED
```

#### `POST /api/approvals/override/:expenseId` (Admin Only)
```json
{ "action": "approved", "comment": "Emergency override" }  // both required
```

---

### 📋 Rules (Admin Only) 🔒

#### `GET /api/rules`
List all approval rules with steps.

#### `POST /api/rules`
```json
{
  "name": "High Value Approval",
  "minAmount": 10000,
  "maxAmount": null,
  "ruleType": "percentage",     // "none" | "percentage" | "specific" | "hybrid"
  "percentageThreshold": 50,
  "steps": [
    { "approverId": "uuid", "stepOrder": 1, "isKeyApprover": false },
    { "approverId": "uuid", "stepOrder": 2, "isKeyApprover": true }
  ]
}
```

#### `PATCH /api/rules/:id`
#### `DELETE /api/rules/:id`

---

### 📸 OCR 🔒

#### `POST /api/ocr/scan` (multipart/form-data)
```
Field: receipt (image file)

// Response
{
  "amount": 1500.50,
  "currency": "INR",
  "category": "food",
  "description": "Restaurant Name | items...",
  "date": "28/03/2025",
  "vendor": "Pizza Palace",
  "rawText": "..."
}
```

---

### 💱 Currency 🔒

#### `GET /api/currency/rates?base=USD`
```json
{ "base": "USD", "rates": { "INR": 83.12, "EUR": 0.92, ... } }
```

#### `GET /api/currency/list`
```json
[{ "code": "INR", "name": "Indian Rupee", "symbol": "₹" }, ...]
```

---

### 📊 Dashboard 🔒

#### `GET /api/dashboard`
Returns role-specific stats automatically:

**Admin** → company overview, category breakdown, recent expenses
**Manager** → pending approvals count, team stats, approval details  
**Employee** → personal expense summary, recent submissions

---

### 🏥 Health Check

#### `GET /api/health`
```json
{ "success": true, "data": { "status": "healthy", "timestamp": "...", "environment": "development" } }
```

---

## Response Format

All responses follow:
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": "Error message" }
```

## HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Not authenticated |
| 403 | Not authorized (wrong role) |
| 404 | Not found |
| 409 | Duplicate / conflict |
| 500 | Server error |

## Approval Rule Types

| Type | Logic |
|------|-------|
| `none` | ALL approvers must approve |
| `percentage` | X% of approvers must approve |
| `specific` | Designated key approver must approve |
| `hybrid` | Either X% OR key approver approval suffices |
