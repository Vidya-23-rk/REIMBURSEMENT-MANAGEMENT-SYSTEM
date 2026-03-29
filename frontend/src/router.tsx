import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SubmitExpense from './pages/employee/SubmitExpense';
import MyExpenses from './pages/employee/MyExpenses';
import PendingApprovals from './pages/manager/PendingApprovals';
import AdminUsers from './pages/admin/Users';
import ApprovalRules from './pages/admin/ApprovalRules';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },

  // Protected routes (wrapped in Layout)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // Employee pages
      {
        path: 'expenses/new',
        element: (
          <RoleGuard allowedRoles={['employee']}>
            <SubmitExpense />
          </RoleGuard>
        ),
      },
      {
        path: 'expenses',
        element: <MyExpenses />,
      },
      // Manager pages
      {
        path: 'approvals',
        element: (
          <RoleGuard allowedRoles={['manager', 'admin']}>
            <PendingApprovals />
          </RoleGuard>
        ),
      },
      // Admin pages
      {
        path: 'users',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <AdminUsers />
          </RoleGuard>
        ),
      },
      {
        path: 'rules',
        element: (
          <RoleGuard allowedRoles={['admin']}>
            <ApprovalRules />
          </RoleGuard>
        ),
      },
    ],
  },

  // 404 catch-all
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
