import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {
  getToken,
  getRefreshToken,
  clearTokens,
  getTokenExpiration,
  scheduleRefreshTokenExpiration,
} from '../../services/auth';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();
  const refreshToken = getRefreshToken();

  // Run real-time timer check
  scheduleRefreshTokenExpiration();

  if (!token && !refreshToken) {
    clearTokens();
    return <Navigate to="/login" replace />;
  }

  const storedExpiresAt = localStorage.getItem('tokenExpiresAt');
  let expTime: number | null = storedExpiresAt ? Number(storedExpiresAt) : null;

  if (!expTime && token) {
    expTime = getTokenExpiration(token);
  }

  if (!expTime && refreshToken) {
    expTime = getTokenExpiration(refreshToken);
  }

  const isTokenExpired = Boolean(expTime && expTime <= Date.now());

  if (isTokenExpired) {
    clearTokens();
    return <Navigate to="/login?state=expired" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export default ProtectedRoute;
