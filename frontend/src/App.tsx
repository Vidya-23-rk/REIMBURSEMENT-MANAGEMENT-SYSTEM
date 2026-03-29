import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import router from './router';
import useAuthStore from './store/authStore';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate);

  // Rehydrate auth from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f0fdf4',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fef2f2',
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}
