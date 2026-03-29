import useAuthStore from '../store/authStore';
import EmployeeDashboard from './employee/Dashboard';
import ManagerDashboard from './manager/Dashboard';
import AdminDashboard from './admin/Dashboard';

/**
 * Smart dashboard that renders the correct view based on user role.
 */
export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
    default:
      return <EmployeeDashboard />;
  }
}
