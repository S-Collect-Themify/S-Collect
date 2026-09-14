import { api } from './api';

export interface PlatformLanguageResponse {
  language?: string;
  defaultLanguage?: string;
  data?: any;
}

export const extractThresholdValue = (data: any): number | null => {
  if (data === null || data === undefined) return null;
  if (typeof data === 'number' && !isNaN(data)) return data;
  if (typeof data === 'string' && !isNaN(Number(data)) && data.trim() !== '') return Number(data);

  const target = data?.data ?? data;

  const raw =
    target?.threshold ??
    target?.defaultLowStockThreshold ??
    target?.default_low_stock_threshold ??
    target?.lowStockThreshold ??
    target?.low_stock_threshold ??
    target?.stockThreshold ??
    target?.stock_threshold ??
    target?.value ??
    (typeof target === 'number' ? target : null);

  if (typeof raw === 'number' && !isNaN(raw)) return raw;
  if (typeof raw === 'string' && !isNaN(Number(raw)) && raw.trim() !== '') return Number(raw);

  return null;
};

export const getPlatformLanguageApi = async (): Promise<string | null> => {
  try {
    const { data } = await api.get('/admin/platform-settings/language');
    const rawLang =
      data?.language ||
      data?.defaultLanguage ||
      data?.default_language ||
      data?.data?.language ||
      data?.data?.defaultLanguage ||
      data?.data?.default_language ||
      (typeof data?.data === 'string' ? data.data : null) ||
      (typeof data === 'string' ? data : null);

    if (rawLang) {
      const str = String(rawLang).trim();
      if (
        str.toLowerCase() === 'ar' ||
        str.toLowerCase() === 'arabic' ||
        str === 'العربية'
      ) {
        return 'Arabic';
      }
      if (
        str.toLowerCase() === 'en' ||
        str.toLowerCase() === 'english' ||
        str === 'الإنجليزية'
      ) {
        return 'English';
      }
      return str;
    }
    return null;
  } catch (err) {
    console.warn('API getPlatformLanguageApi error:', err);
    return null;
  }
};

export const updatePlatformLanguageApi = async (lang: string) => {
  const isAr =
    lang.toLowerCase() === 'ar' ||
    lang.toLowerCase() === 'arabic' ||
    lang === 'العربية';

  const isoCode = isAr ? 'ar' : 'en';
  const nameCode = isAr ? 'Arabic' : 'English';
  const upperCode = isAr ? 'AR' : 'EN';

  // Candidate payload structures for the PUT endpoint
  const candidatePayloads = [
    { language: isoCode },
    { defaultLanguage: isoCode },
    { language: nameCode },
    { defaultLanguage: nameCode },
    { language: upperCode },
    { defaultLanguage: upperCode },
    { language: isoCode, defaultLanguage: isoCode },
    { language: nameCode, defaultLanguage: nameCode },
  ];

  let lastError: any = null;

  for (const payload of candidatePayloads) {
    try {
      const { data } = await api.put(
        '/admin/platform-settings/language',
        payload
      );
      return data;
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
      // If error is not a validation/bad request error (e.g. 401, 403, 500), stop and rethrow
      if (status !== 400 && status !== 422) {
        throw err;
      }
    }
  }

  throw lastError;
};

export const getPlatformStockThresholdApi = async (): Promise<number | null> => {
  try {
    const { data } = await api.get('/admin/platform-settings/stock-threshold');
    return extractThresholdValue(data);
  } catch (err) {
    console.warn('API getPlatformStockThresholdApi error:', err);
    return null;
  }
};

export const updatePlatformStockThresholdApi = async (threshold: number) => {
  const candidatePayloads = [
    { threshold },
    { defaultLowStockThreshold: threshold },
    { default_low_stock_threshold: threshold },
    { lowStockThreshold: threshold },
    { stockThreshold: threshold },
    { value: threshold },
  ];

  let lastError: any = null;

  for (const payload of candidatePayloads) {
    try {
      const { data } = await api.put(
        '/admin/platform-settings/stock-threshold',
        payload
      );
      return data;
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status;
      if (status !== 400 && status !== 422) {
        throw err;
      }
    }
  }

  throw lastError;
};
