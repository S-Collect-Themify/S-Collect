import { api, handleServiceError } from './api';

export const login = async (email: string, password: string) => {
  try {
    const { data } = await api.post('/admin/auth/login', {
      email,
      password,
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Login failed');
  }
};

export const refresh = async (refreshToken: string) => {
  try {
    const { data } = await api.post('/admin/auth/refresh', { refreshToken });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Token refresh failed');
  }
};

export const logout = async (refreshToken: string) => {
  try {
    const { data } = await api.post('/admin/auth/logout', { refreshToken });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Logout failed');
  }
};

export const getToken = (): string | null => localStorage.getItem('token');
export const getRefreshToken = (): string | null =>
  localStorage.getItem('refreshToken');

let logoutTimer: ReturnType<typeof setTimeout> | null = null;

export const clearTokens = (): void => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiresAt');
};

export const getTokenExpiration = (token: string): number | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const logoutAndRedirect = (state: string = 'expired'): void => {
  clearTokens();
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/login')) {
      window.location.href = `/login?state=${state}`;
    }
  }
};

export const saveAuthSession = (
  accessToken?: string | null,
  refreshToken?: string | null,
  expiresInSeconds?: number | null
): void => {
  if (accessToken) {
    localStorage.setItem('token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  let expMs: number | null = null;

  if (typeof expiresInSeconds === 'number' && expiresInSeconds > 0) {
    expMs = Date.now() + expiresInSeconds * 1000;
  } else if (accessToken) {
    expMs = getTokenExpiration(accessToken);
  } else if (refreshToken) {
    expMs = getTokenExpiration(refreshToken);
  }

  if (expMs) {
    localStorage.setItem('tokenExpiresAt', String(expMs));
  }

  scheduleRefreshTokenExpiration();
};

export const scheduleRefreshTokenExpiration = (): void => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = null;
  }

  const token = getToken();
  const refreshToken = getRefreshToken();
  if (!token && !refreshToken) return;

  const storedExpiresAt = localStorage.getItem('tokenExpiresAt');
  let expTime: number | null = storedExpiresAt ? Number(storedExpiresAt) : null;

  if (!expTime && token) {
    expTime = getTokenExpiration(token);
  }

  if (!expTime && refreshToken) {
    expTime = getTokenExpiration(refreshToken);
  }

  if (!expTime) return;

  const now = Date.now();
  const timeRemaining = expTime - now;

  if (timeRemaining <= 0) {
    logoutAndRedirect('expired');
  } else {
    logoutTimer = setTimeout(() => {
      logoutAndRedirect('expired');
    }, timeRemaining);
  }
};
