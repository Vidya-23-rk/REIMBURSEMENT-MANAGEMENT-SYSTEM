import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-surface-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
