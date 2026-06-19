import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserType } from '@/types/api';
import { PageLoader } from '@/components/feedback/PageLoader';
import { getDashboardPath } from '@/lib/nav';

type ProtectedRouteProps = {
  allowedTypes?: UserType[];
};

export function ProtectedRoute({ allowedTypes }: ProtectedRouteProps) {
  const { isAuthenticated, user, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedTypes && !allowedTypes.includes(user.type)) {
    return <Navigate to={getDashboardPath(user.type)} replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.type)} replace />;
  }

  return <Outlet />;
}

export function RootLoader() {
  return <PageLoader />;
}
