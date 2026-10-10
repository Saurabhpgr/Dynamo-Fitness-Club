// ============================================================================
// Route Guard — Protects admin routes, redirects to login when needed
// ============================================================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gym-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save attempted URL for redirect after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gym-bg">
        <div className="text-center p-8 bg-gym-surface rounded-xl border border-gym-border max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h2>
          <p className="text-text-secondary mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-accent text-gym-bg font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
