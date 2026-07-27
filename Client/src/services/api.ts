import axios from "axios";
import { getErrorMessage, type ApiErrorResponseBody } from "../types/api";

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
    this.name = "ServiceError";
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
  fallbackMessage = "An API error occurred"
): ServiceError {
  if (error instanceof ServiceError) {
    return error;
  }

  const message = getErrorMessage(error, fallbackMessage);
  let statusCode: number | undefined = undefined;
  let details: unknown = undefined;
  let isNetworkError = false;

  if (axios.isAxiosError(error)) {
    statusCode = error.response?.status;
    const apiErrorData = error.response?.data as ApiErrorResponseBody | undefined;
    if (apiErrorData) {
      details = apiErrorData.errors || apiErrorData.validation || apiErrorData.details;
    }
    if (!error.response || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
      isNetworkError = true;
    }
  }

  return new ServiceError(message, statusCode, error, details, isNetworkError);
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// flag to prevent infinite loops when refreshing
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

    // If it's a 401 error and the request has not been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't intercept refresh token, login, or logout requests
      if (
        originalRequest.url?.includes("/vendor/auth/refresh") ||
        originalRequest.url?.includes("/vendor/auth/login") ||
        originalRequest.url?.includes("/vendor/auth/logout")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, clear storage and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login?state=expired";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const baseURL = import.meta.env.VITE_API_URL || "/api/v1";
        const cleanBaseURL = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;

        const response = await axios.post(
          `${cleanBaseURL}/vendor/auth/refresh`,
          { refreshToken }
        );

        const data = response.data;
        const newAccessToken = data?.accessToken || data?.data?.accessToken;
        const newRefreshToken = data?.refreshToken || data?.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Refresh failed: No access token returned");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        // Clear credentials and redirect to login with expired state
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (typeof window !== "undefined") {
          window.location.href = "/login?state=expired";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);