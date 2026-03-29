import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
          <div className="text-center max-w-md animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-danger-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-danger-500" />
            </div>
            <h1 className="text-2xl font-display font-bold text-surface-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-surface-500 mb-6">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleRetry}
                className="btn-primary"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <a href="/dashboard" className="btn-ghost">
                <Home className="w-4 h-4" /> Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
