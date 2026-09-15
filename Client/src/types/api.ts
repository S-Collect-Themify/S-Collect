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
export function getErrorMessage(
  error: unknown,
  defaultMessage = 'An unexpected error occurred'
): string {
  if (!error) return defaultMessage;

  let targetError = error;
  if (
    typeof error === 'object' &&
    error !== null &&
    'originalError' in error &&
    (error as any).originalError
  ) {
    targetError = (error as any).originalError;
  }

  if (axios.isAxiosError(targetError)) {
    const axiosError = targetError as ApiAxiosError;
    const responseData = axiosError.response?.data;

    if (responseData) {
      const validationList =
        (responseData.error && typeof responseData.error === 'object'
          ? (responseData.error as any).validation || (responseData.error as any).details
          : null) ||
        responseData.validation ||
        responseData.details ||
        (responseData.error && typeof responseData.error === 'object' && Array.isArray((responseData.error as any).errors)
          ? (responseData.error as any).errors
          : null) ||
        responseData.errors;

      if (Array.isArray(validationList) && validationList.length > 0) {
        const messages = validationList
          .map((v: any) => {
            if (typeof v === 'string') return v;
            return v.message || v.msg || v.issue || v.error || (v.property ? `${v.property}: invalid` : '');
          })
          .filter(Boolean);
        if (messages.length > 0) {
          return messages.join('; ');
        }
      }

      if (Array.isArray(responseData.message)) {
        return responseData.message.filter(Boolean).join(', ');
      }
      if (
        typeof responseData.message === 'string' &&
        responseData.message.trim()
      ) {
        return responseData.message;
      }
      if (typeof responseData.error === 'string' && responseData.error.trim()) {
        return responseData.error;
      }
      if (
        typeof responseData.error === 'object' &&
        responseData.error?.message
      ) {
        if (Array.isArray(responseData.error.message)) {
          return responseData.error.message.filter(Boolean).join(', ');
        }
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
export function getApiErrorResponse(
  error: unknown
): ApiErrorResponseBody | null {
  if (axios.isAxiosError(error)) {
    const axiosError = error as ApiAxiosError;
    return axiosError.response?.data || null;
  }
  return null;
}
