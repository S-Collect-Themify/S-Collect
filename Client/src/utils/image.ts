export const DEFAULT_IMAGE = './placeholder.jpg';

export const getServerBaseUrl = (): string => {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return apiUrl.replace(/\/api\/v1\/?$/, '');
    }
  }
  return '';
};

export const resolveImageUrl = (
  rawUrl: any,
  defaultImage: string = DEFAULT_IMAGE
): string => {
  if (!rawUrl) return defaultImage;
  let urlStr = '';
  if (typeof rawUrl === 'string') {
    urlStr = rawUrl;
  } else if (typeof rawUrl === 'object' && rawUrl !== null) {
    urlStr = rawUrl.url || rawUrl.src || rawUrl.path || '';
  }
  if (!urlStr || typeof urlStr !== 'string' || urlStr.trim() === '') {
    return defaultImage;
  }
  if (
    urlStr.startsWith('http://') ||
    urlStr.startsWith('https://') ||
    urlStr.startsWith('data:')
  ) {
    return urlStr;
  }
  const baseUrl = getServerBaseUrl();
  if (!baseUrl) return urlStr;
  return `${baseUrl}${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
};
