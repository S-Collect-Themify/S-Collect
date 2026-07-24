import axios, { AxiosError } from 'axios';

/**
 * Standard structure for validation error items from backend APIs.
 */
export interface ValidationErrorItem {
  field?: string;
  property?: string;
  param?: string;
  issue?: string;
  message?: string;
  msg?: string;
  error?: string;
}

/**
 * Global interface for backend API error responses.
 */
export interface ApiErrorResponseBody {
  statusCode?: number;
  status?: number;
  message?: string;
  error?: string | ApiErrorResponseBody;
  errors?: ValidationErrorItem[] | Record<string, string | string[]>;
  validation?: ValidationErrorItem[] | Record<string, string | string[]>;
  details?: ValidationErrorItem[] | Record<string, string | string[]>;
  data?: unknown;
  success?: boolean;
}

export type ApiAxiosError = AxiosError<ApiErrorResponseBody>;

/**
 * Safely extracts a user-friendly error message from any caught error (unknown/AxiosError/Error).
 */
export function getErrorMessage(error: unknown, defaultMessage = 'An unexpected error occurred'): string {
  if (!error) return defaultMessage;

  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    const responseData = axiosError.response?.data;

    if (responseData) {
      if (typeof responseData.message === 'string' && responseData.message.trim()) {
        return responseData.message;
      }
      if (typeof responseData.error === 'string' && responseData.error.trim()) {
        return responseData.error;
      }
      if (typeof responseData.error === 'object' && responseData.error?.message) {
        return responseData.error.message;
      }
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
}

/**
 * Safely extracts backend API error details from an unknown error object.
 */
export function getApiErrorResponse(error: unknown): ApiErrorResponseBody | null {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    return axiosError.response?.data || null;
  }
  return null;
}
