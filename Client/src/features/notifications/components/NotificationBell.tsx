import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useVendorNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  className?: string;
  align?: 'left' | 'right';
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  align,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const { data, isLoading } = useVendorNotifications();
  const notifications = data?.items || [];

  // Mark read mutations
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  // Compute unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle outside click & Esc key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAsRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  // Determine alignment: if explicit align passed, use it; otherwise in RTL align to left so dropdown stays on-screen
  const dropdownAlign = align || (isAr ? 'left' : 'right');

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={t('notifications.title', 'Notifications')}
        aria-expanded={isOpen}
        className={`relative inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 cursor-pointer ${
          isOpen
            ? 'bg-white/20 text-white shadow-inner'
            : 'text-gray-100 hover:text-white hover:bg-white/10'
        }`}
      >
        <Bell size={20} className="transition-transform active:scale-95" />

        {/* Unread badge & ping */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-4 min-w-4 items-center justify-center px-1 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        isLoading={isLoading}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        isMarkingAllRead={markAllReadMutation.isPending}
        isMarkingRead={markReadMutation.isPending}
        align={dropdownAlign}
      />
    </div>
  );
};
