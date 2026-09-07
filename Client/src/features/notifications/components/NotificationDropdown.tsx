import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, BellOff, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NotificationFilter, VendorNotification } from '../types';
import { NotificationItem } from './NotificationItem';
import { NotificationSkeleton } from './NotificationSkeleton';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: VendorNotification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isMarkingAllRead: boolean;
  isMarkingRead: boolean;
  align?: 'left' | 'right';
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  notifications,
  isLoading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  isMarkingAllRead,
  isMarkingRead,
  align = 'right',
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<NotificationFilter>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    return true;
  });

  const totalCount = notifications.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          className={`absolute top-full mt-2.5 w-[360px] sm:w-[400px] max-w-[calc(100vw-24px)] bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden flex flex-col ${
            align === 'left' ? 'left-0' : 'right-0'
          }`}
          style={{
            maxHeight: 'min(560px, calc(100vh - 100px))',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {t('notifications.title', 'Notifications')}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {unreadCount} {t('notifications.new', 'new')}
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 cursor-pointer px-2 py-1 rounded-lg hover:bg-blue-50"
                  title={t('notifications.markAllAsRead', 'Mark all as read')}
                >
                  {isMarkingAllRead ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <CheckCheck size={14} />
                  )}
                  <span>
                    {t('notifications.markAllAsRead', 'Mark all as read')}
                  </span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('notifications.filterAll', 'All')} ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  filter === 'unread'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{t('notifications.filterUnread', 'Unread')}</span>
                {unreadCount > 0 && (
                  <span className="w-4 h-4 text-[10px] rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1 overscroll-contain">
            {isLoading ? (
              <NotificationSkeleton />
            ) : filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  {filter === 'unread' ? (
                    <Check size={26} className="text-emerald-500" />
                  ) : (
                    <BellOff size={26} />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                  {filter === 'unread'
                    ? t('notifications.allCaughtUp', 'All caught up!')
                    : t('notifications.noNotifications', 'No notifications yet')}
                </h4>
                <p className="text-xs text-gray-500 max-w-[220px]">
                  {filter === 'unread'
                    ? t(
                        'notifications.noUnreadDesc',
                        'You have read all your notifications.'
                      )
                    : t(
                        'notifications.emptyDesc',
                        'We will notify you when there are new orders or updates.'
                      )}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onMarkAsRead={onMarkAsRead}
                  isMarkingRead={isMarkingRead}
                />
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
