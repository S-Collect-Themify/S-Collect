import { useTranslation } from 'react-i18next';

interface ReturnActionsBarProps {
  onReject?: () => void;
  onApprove?: () => void;
  isUpdating?: boolean;
  status?: string;
}

export function ReturnActionsBar({
  status,
}: ReturnActionsBarProps) {
  const { t } = useTranslation();

  const isResolved =
    status === 'APPROVED' || status === 'REJECTED' || status === 'COMPLETED';

  if (isResolved) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-xs font-semibold text-gray-600">
        {status === 'APPROVED' &&
          t('returnsPage.statusApproved', {
            defaultValue: 'This request has been approved.',
          })}
        {status === 'REJECTED' &&
          t('returnsPage.statusRejected', {
            defaultValue: 'This request has been rejected.',
          })}
        {status === 'COMPLETED' &&
          t('returnsPage.statusCompleted', {
            defaultValue: 'This refund process is completed.',
          })}
      </div>
    );
  }

  return null;
}
