/**
 * RMS Backend — E2E Test Suite
 * Tests all 25 endpoints across admin, manager, and employee roles.
 * Run: npx ts-node tests/e2e.ts
 */

const BASE = 'http://localhost:4000/api';

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  error?: string;
}

const results: TestResult[] = [];
let adminToken = '';
let managerToken = '';
let employeeToken = '';
let createdExpenseId = '';
let createdApprovalId = '';
let createdUserId = '';
let createdRuleId = '';

async function api(
  method: string,
  path: string,
  body?: any,
  token?: string,
  isFormData = false
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options: RequestInit = { method, headers };

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, options);
  const data = await res.json();
  return { status: res.status, data };
}

function test(name: string, passed: boolean, status?: number, error?: string) {
  results.push({ name, passed, status, error });
  const icon = passed ? '✅' : '❌';
  const statusStr = status ? ` [${status}]` : '';
  const errStr = error ? ` — ${error}` : '';
  console.log(`${icon} ${name}${statusStr}${errStr}`);
}

async function run() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   RMS Backend — E2E Test Suite           ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ═══════════════════════════════════════════
  // 1. HEALTH CHECK
  // ═══════════════════════════════════════════
  console.log('── Health Check ──');
  {
    const { status, data } = await api('GET', '/health');
    test('GET /health returns 200', status === 200 && data.success === true, status);
  }

  // ═══════════════════════════════════════════
  // 2. AUTH — Login all roles
  // ═══════════════════════════════════════════
  console.log('\n── Auth: Login ──');
  {
    const { status, data } = await api('POST', '/auth/login', {
      email: 'admin@techcorp.com', password: 'admin123',
    });
    adminToken = data.data?.token || '';
    test('Admin login', status === 200 && !!adminToken, status);
  }
  {
    const { status, data } = await api('POST', '/auth/login', {
      email: 'priya@techcorp.com', password: 'manager123',
    });
    managerToken = data.data?.token || '';
    test('Manager login', status === 200 && !!managerToken, status);
  }
  {
    const { status, data } = await api('POST', '/auth/login', {
      email: 'amit@techcorp.com', password: 'employee123',
    });
    employeeToken = data.data?.token || '';
    test('Employee login', status === 200 && !!employeeToken, status);
  }

  // ═══════════════════════════════════════════
  // 3. AUTH — Edge Cases
  // ═══════════════════════════════════════════
  console.log('\n── Auth: Edge Cases ──');
  {
    const { status } = await api('POST', '/auth/login', {
      email: 'admin@techcorp.com', password: 'wrongpassword',
    });
    test('Wrong password → 401', status === 401, status);
  }
  {
    const { status } = await api('POST', '/auth/login', {
      email: 'nonexistent@test.com', password: 'test',
    });
    test('Nonexistent email → 401', status === 401, status);
  }
  {
    const { status } = await api('POST', '/auth/login', { email: 'admin@techcorp.com' });
    test('Missing password → 400', status === 400, status);
  }
  {
    const { status } = await api('GET', '/auth/me');
    test('No token → 401', status === 401, status);
  }
  {
    const { status } = await api('GET', '/auth/me', undefined, 'invalid.token.here');
    test('Invalid token → 401', status === 401, status);
  }

  // ═══════════════════════════════════════════
  // 4. AUTH — GET /me
  // ═══════════════════════════════════════════
  console.log('\n── Auth: /me ──');
  {
    const { status, data } = await api('GET', '/auth/me', undefined, adminToken);
    test('GET /me (admin) returns user + company', 
      status === 200 && data.data?.role === 'admin' && !!data.data?.company, status);
  }
  {
    const { status, data } = await api('GET', '/auth/me', undefined, employeeToken);
    test('GET /me (employee) returns user + manager', 
      status === 200 && data.data?.role === 'employee', status);
  }

  // ═══════════════════════════════════════════
  // 5. USERS — CRUD (admin-only)
  // ═══════════════════════════════════════════
  console.log('\n── Users: CRUD ──');
  {
    const { status, data } = await api('GET', '/users', undefined, adminToken);
    test('List users (admin)', status === 200 && Array.isArray(data.data), status);
  }
  {
    const { status } = await api('GET', '/users', undefined, employeeToken);
    test('List users (employee) → 403', status === 403, status);
  }
  {
    const { status } = await api('GET', '/users', undefined, managerToken);
    test('List users (manager) → 403', status === 403, status);
  }
  {
    const { status, data } = await api('POST', '/users', {
      name: 'Test User E2E',
      email: 'e2e-test@techcorp.com',
      password: 'test123',
      role: 'employee',
    }, adminToken);
    createdUserId = data.data?.id || '';
    test('Create user (admin)', status === 201 && !!createdUserId, status);
  }
  {
    const { status } = await api('POST', '/users', {
      name: 'Duplicate',
      email: 'e2e-test@techcorp.com',
      password: 'test',
      role: 'employee',
    }, adminToken);
    test('Duplicate email → 409', status === 409, status);
  }
  {
    const { status, data } = await api('PATCH', `/users/${createdUserId}`, {
      name: 'Updated E2E User',
    }, adminToken);
    test('Update user', status === 200 && data.data?.name === 'Updated E2E User', status);
  }
  {
    const { status } = await api('DELETE', `/users/${createdUserId}`, undefined, adminToken);
    test('Delete user', status === 200, status);
  }

  // ═══════════════════════════════════════════
  // 6. RULES — CRUD (admin-only)
  // ═══════════════════════════════════════════
  console.log('\n── Rules: CRUD ──');
  {
    const { status, data } = await api('GET', '/rules', undefined, adminToken);
    test('List rules (admin)', status === 200 && Array.isArray(data.data), status);
  }
  {
    const { status } = await api('GET', '/rules', undefined, employeeToken);
    test('List rules (employee) → 403', status === 403, status);
  }

  // Get an approver ID for the test rule
  const usersRes = await api('GET', '/users', undefined, adminToken);
  const managerId = usersRes.data.data?.find((u: any) => u.role === 'manager')?.id || '';

  {
    const { status, data } = await api('POST', '/rules', {
      name: 'E2E Test Rule',
      minAmount: 0,
      maxAmount: 100,
      ruleType: 'none',
      steps: [{ approverId: managerId, stepOrder: 1, isKeyApprover: false }],
    }, adminToken);
    createdRuleId = data.data?.id || '';
    test('Create rule with steps', status === 201 && !!createdRuleId, status);
  }
  {
    const { status } = await api('PATCH', `/rules/${createdRuleId}`, {
      name: 'E2E Test Rule Updated',
    }, adminToken);
    test('Update rule', status === 200, status);
  }
  {
    const { status } = await api('DELETE', `/rules/${createdRuleId}`, undefined, adminToken);
    test('Delete rule', status === 200, status);
  }

  // ═══════════════════════════════════════════
  // 7. CURRENCY
  // ═══════════════════════════════════════════
  console.log('\n── Currency ──');
  {
    const { status, data } = await api('GET', '/currency/rates?base=USD', undefined, employeeToken);
    test('Get FX rates', status === 200 && !!data.data?.rates, status);
  }
  {
    const { status, data } = await api('GET', '/currency/list', undefined, employeeToken);
    test('Get currency list', status === 200 && Array.isArray(data.data), status);
  }
  {
    const { status } = await api('GET', '/currency/rates');
    test('Currency without token → 401', status === 401, status);
  }

  // ═══════════════════════════════════════════
  // 8. EXPENSES — Full CRUD
  // ═══════════════════════════════════════════
  console.log('\n── Expenses ──');
  {
    const { status, data } = await api('POST', '/expenses', {
      amount: 5000,
      currency: 'INR',
      category: 'travel',
      description: 'E2E Test — Train to Delhi',
      expenseDate: '2025-03-28',
    }, employeeToken);
    createdExpenseId = data.data?.id || '';
    test('Submit expense (employee)',
      status === 201 && !!createdExpenseId, status);
  }
  {
    const { status, data } = await api('GET', '/expenses/mine', undefined, employeeToken);
    test('Get my expenses',
      status === 200 && Array.isArray(data.data) && data.data.length > 0, status);
  }
  {
    const { status } = await api('POST', '/expenses', {
      amount: 100, currency: 'INR', category: 'food',
    }, employeeToken);
    test('Missing fields → 400', status === 400, status);
  }
  {
    const { status, data } = await api('GET', '/expenses', undefined, adminToken);
    test('List all expenses (admin)',
      status === 200 && !!data.data?.expenses, status);
  }
  {
    const { status } = await api('GET', '/expenses', undefined, employeeToken);
    test('List all expenses (employee) → 403', status === 403, status);
  }
  {
    const { status, data } = await api('GET', `/expenses/${createdExpenseId}`, undefined, adminToken);
    test('Get expense by ID',
      status === 200 && data.data?.id === createdExpenseId, status);
  }
  {
    const { status } = await api('GET', '/expenses/nonexistent-id', undefined, adminToken);
    test('Nonexistent expense → 404', status === 404, status);
  }

  // ═══════════════════════════════════════════
  // 9. APPROVALS — Full Flow
  // ═══════════════════════════════════════════
  console.log('\n── Approvals: Full Flow ──');
  {
    const { status, data } = await api('GET', '/approvals/pending', undefined, managerToken);
    test('Get pending approvals (manager)', status === 200 && Array.isArray(data.data), status);

    if (data.data && data.data.length > 0) {
      createdApprovalId = data.data[0].id;
      test('Has pending approval requests', true);

      // Approve the first one
      const approveRes = await api('POST', `/approvals/${createdApprovalId}/approve`, {
        comment: 'Looks good — E2E test',
      }, managerToken);
      test('Approve request', approveRes.status === 200, approveRes.status);
    } else {
      test('Has pending approval requests', false, undefined, 'No pending approvals found');
    }
  }
  {
    const { status } = await api('GET', '/approvals/pending', undefined, employeeToken);
    test('Pending approvals (employee) → 403', status === 403, status);
  }
  {
    const { status } = await api('POST', '/approvals/fake-id/reject', {}, managerToken);
    test('Reject without comment → 400', status === 400, status);
  }

  // Test admin override
  {
    // Submit a new expense to override
    const expRes = await api('POST', '/expenses', {
      amount: 9999, currency: 'INR', category: 'equipment',
      description: 'Override test', expenseDate: '2025-03-28',
    }, employeeToken);
    const overrideExpenseId = expRes.data.data?.id;

    if (overrideExpenseId) {
      const { status } = await api('POST', `/approvals/override/${overrideExpenseId}`, {
        action: 'approved',
        comment: 'Admin override E2E test',
      }, adminToken);
      test('Admin override', status === 200, status);
    }
  }

  // ═══════════════════════════════════════════
  // 10. DASHBOARD
  // ═══════════════════════════════════════════
  console.log('\n── Dashboard ──');
  {
    const { status, data } = await api('GET', '/dashboard', undefined, adminToken);
    test('Admin dashboard', status === 200 && data.data?.role === 'admin' && !!data.data?.overview, status);
  }
  {
    const { status, data } = await api('GET', '/dashboard', undefined, managerToken);
    test('Manager dashboard', status === 200 && data.data?.role === 'manager', status);
  }
  {
    const { status, data } = await api('GET', '/dashboard', undefined, employeeToken);
    test('Employee dashboard', status === 200 && data.data?.role === 'employee', status);
  }
  {
    const { status } = await api('GET', '/dashboard');
    test('Dashboard without token → 401', status === 401, status);
  }

  // ═══════════════════════════════════════════
  // 11. 404 HANDLER
  // ═══════════════════════════════════════════
  console.log('\n── Edge Cases ──');
  {
    const { status, data } = await api('GET', '/nonexistent-route');
    test('Unknown route → 404', status === 404 && data.error === 'Route not found', status);
  }

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log('\n╔══════════════════════════════════════════╗');
  console.log(`║   Results: ${passed}/${total} passed, ${failed} failed`);
  console.log('╚══════════════════════════════════════════╝\n');

  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ❌ ${r.name} [${r.status}] ${r.error || ''}`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
