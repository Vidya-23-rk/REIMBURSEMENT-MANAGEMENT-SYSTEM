import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <span className="text-[140px] font-display font-black text-surface-100 leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/20 animate-pulse-soft">
              <span className="text-3xl">🔍</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-surface-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard" className="btn-primary">
            <Home className="w-4 h-4" /> Dashboard
          </Link>
          <button onClick={() => history.back()} className="btn-ghost">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
