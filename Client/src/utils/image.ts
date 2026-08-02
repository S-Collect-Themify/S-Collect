export const DEFAULT_IMAGE = './placeholder.jpg';

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
  return `https://api.collect-s.com${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
};
