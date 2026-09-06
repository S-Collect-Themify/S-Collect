import { useTranslation } from 'react-i18next';
import { BellOff } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationTrigger } from './NotificationTrigger';
import { NotificationHeader } from './NotificationHeader';
import { NotificationItem } from './NotificationItem';

export const NotificationDropdown = () => {
  const { i18n, t } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

  return (
    <PortalDropdown
      align={isAr ? 'left' : 'right'}
      minWidth={340}
      animate
      menuClassName="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100/80 min-w-[320px] sm:min-w-[360px] max-w-[400px] z-50 overflow-hidden"
      trigger={({ isOpen, toggle }) => (
        <NotificationTrigger
          unreadCount={unreadCount}
          isOpen={isOpen}
          toggle={toggle}
        />
      )}
    >
      {({ close }) => (
        <div className="flex flex-col max-h-115">
          <NotificationHeader
            hasNotifications={notifications.length > 0}
            onClearAll={() => {
              clearAll();
            }}
          />

          <div className="overflow-y-auto mt-2 space-y-1.5 max-h-95 custom-scrollbar px-0.5">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onCloseDropdown={close}
                />
              ))
            ) : (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 text-gray-400">
                  <BellOff size={22} />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {t('notifications.noNotifications', 'لا توجد إشعارات حالياً')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalDropdown>
  );
};
