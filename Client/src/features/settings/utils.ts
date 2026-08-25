import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {
  UseFormSetError,
  FieldValues,
  Path,
  ErrorOption,
} from 'react-hook-form';
import { ServiceError } from '../../services/api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getPasswordStrength(password: string): number {
  return [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export function mapServiceErrorsToForm<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap?: Record<string, Path<TFieldValues>>
) {
  if (!(error instanceof ServiceError) || !error.details) {
    return;
  }

  const details = error.details;

  const getMappedFieldName = (key: string): Path<TFieldValues> => {
    if (fieldMap && fieldMap[key]) {
      return fieldMap[key];
    }
    return key as Path<TFieldValues>;
  };

  if (Array.isArray(details)) {
    details.forEach((err: unknown) => {
      if (!err || typeof err !== 'object') return;
      const errObj = err as Record<string, unknown>;
      const key =
        typeof errObj.property === 'string'
          ? errObj.property
          : typeof errObj.field === 'string'
            ? errObj.field
            : typeof errObj.key === 'string'
              ? errObj.key
              : null;
      const msg = errObj.message || errObj.msg || errObj.error;

      if (key && msg) {
        const fieldName = getMappedFieldName(key);
        setError(fieldName, {
          type: 'server',
          message: Array.isArray(msg) ? msg.join(', ') : String(msg),
        } as ErrorOption);
      }
    });
  } else if (typeof details === 'object' && details !== null) {
    const detailsObj = details as Record<string, unknown>;
    Object.keys(detailsObj).forEach((key) => {
      const val = detailsObj[key];
      if (!val) return;

      const fieldName = getMappedFieldName(key);
      const messages = Array.isArray(val) ? val : [val];
      const cleanMessages = messages.map((m) =>
        typeof m === 'object' ? JSON.stringify(m) : String(m)
      );
      const messageStr = cleanMessages.join(', ');

      setError(fieldName, {
        type: 'server',
        message: messageStr,
      } as ErrorOption);
    });
  }
}

export function normalizeSaudiPhone(val?: string | null): string {
  if (!val) return '+966';
  const cleaned = val.trim();
  if (cleaned === '') return '+966';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00966')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('966')) return '+' + cleaned;
  if (cleaned.startsWith('05')) return '+966' + cleaned.slice(1);
  if (cleaned.startsWith('5')) return '+966' + cleaned;
  return '+966' + cleaned;
}

export function formatSaudiPhone(value?: string | null): {
  formatted: string;
  full: string;
} {
  if (!value) return { formatted: '', full: '' };

  let digits = String(value).replace(/\D/g, '');

  if (digits.startsWith('966')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 9);

  let formatted = '';
  if (digits.length > 0) {
    formatted = digits.slice(0, 2);
    if (digits.length > 2) {
      formatted += ' ' + digits.slice(2, 5);
    }
    if (digits.length > 5) {
      formatted += ' ' + digits.slice(5, 9);
    }
  }

  const full = digits ? `+966${digits}` : '';
  return { formatted, full };
}

export function isValidSaudiPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const { full } = formatSaudiPhone(phone);
  return full.length === 13 && /^\+966[1-9]\d{8}$/.test(full);
}

