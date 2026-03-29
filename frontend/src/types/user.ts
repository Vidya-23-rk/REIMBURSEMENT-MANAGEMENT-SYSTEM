export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  companyId: string;
  managerId: string | null;
  isManagerApprover: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
  managerId?: string;
}

export interface UpdateUserPayload {
  role?: 'admin' | 'manager' | 'employee';
  managerId?: string;
  isManagerApprover?: boolean;
}

export type UserRole = User['role'];
