import { useTranslation } from 'react-i18next';
import type { AdminNotification } from '../types/notification.types';

interface NotificationItemProps {
  notification: AdminNotification;
  onRead?: (id: string) => void;
  onCloseDropdown?: () => void;
}

export const NotificationItem = ({
  notification,
  onRead,
  onCloseDropdown,
}: NotificationItemProps) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const handleClick = () => {
    if (!notification.isRead && onRead) {
      onRead(notification.id);
    }
    if (onCloseDropdown) {
      onCloseDropdown();
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return isAr ? 'الآن' : 'Just now';
      }
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return isAr
          ? `منذ ${diffInMinutes} دقيقة`
          : `${diffInMinutes}m ago`;
      }
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return isAr
          ? `منذ ${diffInHours} ساعات`
          : `${diffInHours}h ago`;
      }
      const diffInDays = Math.floor(diffInHours / 24);
      return isAr
        ? `منذ ${diffInDays} يوم`
        : `${diffInDays}d ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
        notification.isRead ? 'bg-transparent hover:bg-gray-50/80' : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Right section in RTL (or left in LTR): Title + unread dot */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-bold text-gray-900 truncate tracking-tight">
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0 inline-block" />
          )}
        </div>

        {/* Left section in RTL (or right in LTR): Timestamp */}
        <span className="text-xs text-gray-400 font-normal whitespace-nowrap shrink-0 pt-0.5">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>

      {/* Description / Message */}
      <p className="text-sm text-gray-500 font-normal line-clamp-2 mt-1 text-start dir-ltr:text-left leading-relaxed">
        {notification.message}
      </p>
    </div>
  );
};
