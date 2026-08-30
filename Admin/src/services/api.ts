import axios from 'axios';
import { getErrorMessage, type ApiErrorResponseBody } from '../types/api';
import { logoutAndRedirect, saveAuthSession } from './auth';

export class ServiceError extends Error {
  public readonly statusCode?: number;
  public readonly originalError?: unknown;
  public readonly details?: unknown;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    statusCode?: number,
    originalError?: unknown,
    details?: unknown,
    isNetworkError: boolean = false
  ) {
    super(message);
    this.name = 'ServiceError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.details = details;
    this.isNetworkError = isNetworkError;

    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * Normalizes any API service error into a structured ServiceError instance.
 */
export function handleServiceError(
  error: unknown,
  fallbackMessage = 'An API error occurred'
): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  console.error('>>> [API Error Debug] Raw Error:', error);
  if (axios.isAxiosError(error)) {
    console.error(
      '>>> [API Error Debug] Response Status:',
      error.response?.status
    );
    console.error('>>> [API Error Debug] Response Data:', error.response?.data);
  }

  const message = getErrorMessage(error, fallbackMessage);
  let statusCode: number | undefined = undefined;
  let details: unknown = undefined;
  let isNetworkError = false;

  if (axios.isAxiosError(error)) {
    statusCode = error.response?.status;
    const apiErrorData = error.response?.data as
      | ApiErrorResponseBody
      | undefined;
    if (apiErrorData) {
      const nestedError =
        typeof apiErrorData.error === 'object' && apiErrorData.error !== null
          ? (apiErrorData.error as Record<string, unknown>)
          : null;

      details =
        apiErrorData.errors ||
        apiErrorData.validation ||
        apiErrorData.details ||
        (nestedError &&
          (nestedError.errors ||
            nestedError.validation ||
            nestedError.details));
    }
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED'
    ) {
      isNetworkError = true;
    }
  }

  return new ServiceError(message, statusCode, error, details, isNetworkError);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Flag to prevent infinite loops when refreshing
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 Unauthorized errors
    if (status === 401) {
      const isLoginRequest = originalRequest?.url?.includes('/admin/auth/login');
      const isRefreshRequest = originalRequest?.url?.includes('/admin/auth/refresh');
      const isLogoutRequest = originalRequest?.url?.includes('/admin/auth/logout');

      // Do not redirect if it's the login request itself (let login page display invalid credentials error)
      if (!isLoginRequest) {
        const refreshToken = localStorage.getItem('refreshToken');

        // If refreshToken exists and this request hasn't been retried yet, attempt token refresh
        if (
          refreshToken &&
          originalRequest &&
          !originalRequest._retry &&
          !isRefreshRequest &&
          !isLogoutRequest
        ) {
          originalRequest._retry = true;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => {
                logoutAndRedirect();
                return Promise.reject(err);
              });
          }

          isRefreshing = true;

          try {
            const baseURL = import.meta.env.VITE_API_URL || '/api/v1';
            const cleanBaseURL = baseURL.endsWith('/')
              ? baseURL.slice(0, -1)
              : baseURL;

            const response = await axios.post(
              `${cleanBaseURL}/admin/auth/refresh`,
              { refreshToken }
            );

            const data = response.data;
            const newAccessToken =
              data?.accessToken || data?.data?.accessToken || data?.token;
            const newRefreshToken =
              data?.refreshToken || data?.data?.refreshToken;
            const expiresInSeconds =
              data?.expiresInSeconds || data?.data?.expiresInSeconds;

            if (newAccessToken) {
              saveAuthSession(
                newAccessToken,
                newRefreshToken,
                expiresInSeconds
              );

              processQueue(null, newAccessToken);
              isRefreshing = false;

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalRequest);
            } else {
              throw new Error('Refresh failed: No access token returned');
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;

            // Clear credentials and redirect to login
            logoutAndRedirect();
            return Promise.reject(refreshError);
          }
        }

        // For any other 401 (no refresh token, retried request failed with 401, refresh/logout endpoint failed), redirect to login
        logoutAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);