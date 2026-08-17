import { api } from './api';

export interface PlatformLanguageResponse {
  language?: string;
  defaultLanguage?: string;
  data?: any;
}

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
