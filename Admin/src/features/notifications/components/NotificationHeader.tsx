import { useTranslation } from 'react-i18next';

interface NotificationHeaderProps {
  onClearAll: () => void;
  hasNotifications: boolean;
}

export const NotificationHeader = ({
  onClearAll,
  hasNotifications,
}: NotificationHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between px-1 pb-2.5 pt-0.5 border-b border-gray-200">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
        {t('notifications.title', 'الإشعارات')}
      </h3>
      {hasNotifications && (
        <button
          onClick={onClearAll}
          type="button"
          className="text-xs sm:text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none"
        >
          {t('notifications.clearAll', 'مسح الكل')}
        </button>
      )}
    </div>
  );
};
