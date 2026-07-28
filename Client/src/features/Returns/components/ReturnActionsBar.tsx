import { useTranslation } from 'react-i18next';

interface ReturnActionsBarProps {
  onReject: () => void;
  onApprove: () => void;
  isUpdating?: boolean;
  status?: string;
}

export function ReturnActionsBar({
  onReject,
  onApprove,
  isUpdating,
  status,
}: ReturnActionsBarProps) {
  const { t } = useTranslation();

  const isResolved = status === 'APPROVED' || status === 'REJECTED' || status === 'COMPLETED';

  if (isResolved) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xs font-semibold text-gray-600">
        {status === 'APPROVED' && t('returnsPage.statusApproved', { defaultValue: 'This request has been approved.' })}
        {status === 'REJECTED' && t('returnsPage.statusRejected', { defaultValue: 'This request has been rejected.' })}
        {status === 'COMPLETED' && t('returnsPage.statusCompleted', { defaultValue: 'This refund process is completed.' })}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Action Buttons */}
      <div className="hidden md:flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onReject}
          disabled={isUpdating}
          className="py-3 px-6 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
        >
          {t('returnsPage.rejectReturn', { defaultValue: 'Reject Return' })}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isUpdating}
          className="py-3 px-6 rounded-xl bg-gray-950 text-white text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md active:scale-95"
        >
          {isUpdating
            ? t('returnsPage.updating', { defaultValue: 'Updating...' })
            : t('returnsPage.approveReturn', { defaultValue: 'Approve Return' })}
        </button>
      </div>

      {/* Fixed Sticky Action Bar for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 flex items-center gap-3 shadow-lg">
        <button
          type="button"
          onClick={onReject}
          disabled={isUpdating}
          className="flex-1 py-3 px-4 rounded-xl border border-red-200 text-red-600 text-xs sm:text-sm font-bold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
        >
          {t('returnsPage.rejectReturn', { defaultValue: 'Reject Return' })}
        </button>
        <button
          type="button"
          onClick={onApprove}
          disabled={isUpdating}
          className="flex-1 py-3 px-4 rounded-xl bg-gray-950 text-white text-xs sm:text-sm font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md active:scale-95"
        >
          {isUpdating
            ? t('returnsPage.updating', { defaultValue: 'Updating...' })
            : t('returnsPage.approveReturn', { defaultValue: 'Approve Return' })}
        </button>
      </div>
    </>
  );
}
