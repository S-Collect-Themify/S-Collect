import { useTranslation } from 'react-i18next';
import { type ReturnItem } from '../types';

export function StatusBadge({ status }: { status: ReturnItem['status'] }) {
  const { t } = useTranslation();

  const config = {
    PENDING_REVIEW: {
      labelKey: 'returnsPage.statuses.pendingReview',
      defaultLabel: 'Pending Review',
      cls: 'bg-[#FEF3C7] text-[#B45309] border-none',
    },
    APPROVED: {
      labelKey: 'returnsPage.statuses.approved',
      defaultLabel: 'Approved',
      cls: 'bg-[#D1FAE5] text-[#059669] border-none',
    },
    REJECTED: {
      labelKey: 'returnsPage.statuses.rejected',
      defaultLabel: 'Rejected',
      cls: 'bg-[#FEE2E2] text-[#DC2626] border-none',
    },
    AWAITING_ITEM: {
      labelKey: 'returnsPage.statuses.awaitingItem',
      defaultLabel: 'Awaiting Item',
      cls: 'bg-[#EFF6FF] text-[#059669] border-none',
    },
    COMPLETED: {
      labelKey: 'returnsPage.statuses.completed',
      defaultLabel: 'Completed',
      cls: 'bg-[#ECFDF5] text-[#047857] border-none',
    },
  };

  const current = config[status] || config.PENDING_REVIEW;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${current.cls}`}
    >
      {t(current.labelKey, { defaultValue: current.defaultLabel })}
    </span>
  );
}
