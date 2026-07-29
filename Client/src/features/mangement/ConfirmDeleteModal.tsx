import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Check, AlertTriangle, Trash2 } from 'lucide-react';

type IconVariant = 'delete' | 'publish' | 'unpublish';

const iconConfig: Record<
  IconVariant,
  { bg: string; icon: typeof Check; iconClass: string }
> = {
  delete: { bg: 'bg-red-100', icon: Trash2, iconClass: 'text-red-500' },
  publish: { bg: 'bg-green-100', icon: Check, iconClass: 'text-green-500' },
  unpublish: {
    bg: 'bg-red-100',
    icon: AlertTriangle,
    iconClass: 'text-red-600',
  },
};

type ConfirmDeleteModalProps = {
  titleKey?: string;
  messageKey: string;
  messageValues?: Record<string, string | number>;
  confirmKey?: string;
  confirmClassName?: string;
  iconVariant?: IconVariant;
  onConfirm: () => void;
  onClose?: () => void;
};

export function ConfirmDeleteModal({
  titleKey = 'managementTable.deleteConfirmTitle',
  messageKey,
  messageValues,
  confirmKey = 'managementTable.delete',
  confirmClassName = 'bg-red-600 hover:bg-red-700',
  iconVariant = 'delete',
  onConfirm,
  onClose,
}: ConfirmDeleteModalProps) {
  const { t } = useTranslation();
  const { bg, icon: Icon, iconClass } = iconConfig[iconVariant];

  const handleClose = () => {
    toast.dismiss();
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon */}
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${bg}`}
        >
          <Icon className={`h-8 w-8 ${iconClass}`} />
        </div>

        {/* Title */}
        <h3 className="mt-5 text-center text-2xl font-semibold text-gray-900">
          {t(titleKey)}
        </h3>

        {/* Description */}
        <p className="mt-3 text-center text-sm text-gray-500">
          {t(messageKey, messageValues)}
        </p>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className={`flex-1 cursor-pointer rounded-lg py-3 text-sm font-medium text-white transition ${confirmClassName}`}
          >
            {t(confirmKey)}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="flex-1 cursor-pointer rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t('managementTable.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
