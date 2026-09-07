/**
 * Formats an ISO date string into a localized relative time string (e.g. "Just now", "5m ago", "منذ 5 دقائق")
 */
export function formatRelativeTime(dateString: string, isAr: boolean): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return isAr ? 'الآن' : 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (isAr) {
      if (diffInMinutes === 1) return 'منذ دقيقة';
      if (diffInMinutes === 2) return 'منذ دقيقتين';
      if (diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`;
      return `منذ ${diffInMinutes} دقيقة`;
    }
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (isAr) {
      if (diffInHours === 1) return 'منذ ساعة';
      if (diffInHours === 2) return 'منذ ساعتين';
      if (diffInHours <= 10) return `منذ ${diffInHours} ساعات`;
      return `منذ ${diffInHours} ساعة`;
    }
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    if (isAr) {
      if (diffInDays === 1) return 'أمس';
      if (diffInDays === 2) return 'منذ يومين';
      if (diffInDays <= 10) return `منذ ${diffInDays} أيام`;
      return `منذ ${diffInDays} يوم`;
    }
    return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`;
  }

  return date.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });
}
