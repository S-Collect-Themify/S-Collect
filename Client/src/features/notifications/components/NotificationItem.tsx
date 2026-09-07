import React from 'react';
import { Check, Clock, BellRing, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { VendorNotification } from '../types';
import { formatRelativeTime } from '../utils/formatTime';

interface NotificationItemProps {
  notification: VendorNotification;
  onMarkAsRead: (id: string) => void;
  isMarkingRead?: boolean;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  isMarkingRead = false,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const timeFormatted = formatRelativeTime(notification.createdAt, isAr);

  const handleRowClick = () => {
    if (!notification.isRead && !isMarkingRead) {
      onMarkAsRead(notification.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.isRead && !isMarkingRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 cursor-pointer border ${
        notification.isRead
          ? 'bg-white hover:bg-gray-50/80 border-gray-100 text-gray-700'
          : 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-100/70 text-gray-900 shadow-xs'
      }`}
    >
      {/* Leading Icon / Indicator */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          notification.isRead
            ? 'bg-gray-100 text-gray-400'
            : 'bg-blue-600 text-white shadow-xs'
        }`}
      >
        {notification.isRead ? <Bell size={16} /> : <BellRing size={16} />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4
            className={`text-sm line-clamp-1 ${
              notification.isRead
                ? 'font-medium text-gray-800'
                : 'font-semibold text-gray-950'
            }`}
          >
            {notification.title}
          </h4>

          {/* Unread indicator dot */}
          {!notification.isRead && (
            <span
              className="inline-block w-2 h-2 rounded-full bg-blue-600 shrink-0 ring-2 ring-blue-200"
              title={t('notifications.unread', 'Unread')}
            />
          )}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
          {notification.body}
        </p>

        <div className="flex items-center justify-between gap-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1 font-normal">
            <Clock size={12} className="shrink-0" />
            <span>{timeFormatted}</span>
          </span>

          {/* Mark as read button */}
          {!notification.isRead && (
            <button
              type="button"
              onClick={handleActionClick}
              disabled={isMarkingRead}
              className="opacity-80 group-hover:opacity-100 inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 transition-opacity px-1.5 py-0.5 rounded hover:bg-blue-100/60"
              title={t('notifications.markAsRead', 'Mark as read')}
            >
              <Check size={12} />
              <span>{t('notifications.markAsRead', 'Mark read')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
