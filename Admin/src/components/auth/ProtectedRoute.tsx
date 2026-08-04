import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  getToken,
  getRefreshToken,
  clearTokens,
  getTokenExpiration,
} from '../../services/auth';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();
  const refreshToken = getRefreshToken();

  if (!token && !refreshToken) {
    clearTokens();
    return <Navigate to="/login" replace />;
  }

  if (token) {
    const expTime = getTokenExpiration(token);
    if (expTime && Date.now() >= expTime) {
      if (!refreshToken) {
        clearTokens();
        return <Navigate to="/login?state=expired" replace />;
      }
      const refreshExp = getTokenExpiration(refreshToken);
      if (refreshExp && Date.now() >= refreshExp) {
        clearTokens();
        return <Navigate to="/login?state=expired" replace />;
      }
    }
  } else if (refreshToken) {
    const refreshExp = getTokenExpiration(refreshToken);
    if (refreshExp && Date.now() >= refreshExp) {
      clearTokens();
      return <Navigate to="/login?state=expired" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
