import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: string;
}

export default function RoleGuard({ children, allowedRoles, fallback = '/dashboard' }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
