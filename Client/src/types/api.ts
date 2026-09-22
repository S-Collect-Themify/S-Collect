import axios, { AxiosError } from 'axios';
import i18n from '../i18n';

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
 * Normalizes technical error keys into localized user-friendly messages.
 */
export function normalizeErrorMessage(msg: string): string {
  if (!msg) return msg;

  const trimmed = msg.trim();
  const lower = trimmed.toLowerCase();

  if (
    trimmed === 'common.UNAUTHORIZED' ||
    trimmed === 'UNAUTHORIZED' ||
    trimmed === 'common.FORBIDDEN' ||
    trimmed === 'FORBIDDEN' ||
    trimmed === 'ACCOUNT_DEACTIVATED' ||
    trimmed === 'DEACTIVATED' ||
    trimmed === 'VENDOR_DEACTIVATED' ||
    trimmed === 'common.DEACTIVATED' ||
    lower.includes('unauthorized') ||
    lower.includes('account_deactivated') ||
    lower.includes('vendor_deactivated')
  ) {
    if (i18n.exists('common.UNAUTHORIZED')) {
      return i18n.t('common.UNAUTHORIZED');
    }
    return i18n.language === 'ar'
      ? 'تم إلغاء تفعيل حسابك.'
      : 'Your account has been deactivated.';
  }

  if (i18n.exists(trimmed)) {
    return i18n.t(trimmed);
  }

  return trimmed;
}

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

  let extractedMsg: string | null = null;

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
          extractedMsg = messages.join('; ');
        }
      }

      if (!extractedMsg) {
        if (Array.isArray(responseData.message)) {
          extractedMsg = responseData.message.filter(Boolean).join(', ');
        } else if (
          typeof responseData.message === 'string' &&
          responseData.message.trim()
        ) {
          extractedMsg = responseData.message;
        } else if (typeof responseData.error === 'string' && responseData.error.trim()) {
          extractedMsg = responseData.error;
        } else if (
          typeof responseData.error === 'object' &&
          responseData.error?.message
        ) {
          if (Array.isArray(responseData.error.message)) {
            extractedMsg = responseData.error.message.filter(Boolean).join(', ');
          } else {
            extractedMsg = responseData.error.message;
          }
        }
      }
    }

    if (!extractedMsg && axiosError.message) {
      extractedMsg = axiosError.message;
    }
  }

  if (!extractedMsg && error instanceof Error && error.message) {
    extractedMsg = error.message;
  }

  if (!extractedMsg && typeof error === 'string') {
    extractedMsg = error;
  }

  const result = extractedMsg || defaultMessage;
  return normalizeErrorMessage(result);
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
