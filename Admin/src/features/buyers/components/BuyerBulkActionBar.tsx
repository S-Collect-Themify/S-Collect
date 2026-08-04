import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

interface BuyerBulkActionBarProps {
  selectedCount: number;
  selectedRows: string[];
  onBulkActivate: () => void;
  onBulkSuspend: () => void;
  clearSelection: () => void;
}

export default function BuyerBulkActionBar({
  selectedCount,
  onBulkActivate,
  onBulkSuspend,
  clearSelection,
}: BuyerBulkActionBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="fixed left-1/2 bottom-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-gray-900 text-sm font-semibold">
        {selectedCount}
      </div>
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
        {t('buyers.table.selected', { count: selectedCount, defaultValue: `${selectedCount} selected` })}
      </span>

      <button
        onClick={onBulkActivate}
        className="flex px-3.5 py-1.5 items-center justify-center rounded-lg border border-green-600 text-green-600 transition-colors hover:bg-green-50 text-xs font-semibold cursor-pointer"
      >
        {t('buyers.table.activateSelected', 'Activate Selected')}
      </button>

      <button
        onClick={onBulkSuspend}
        className="flex px-3.5 py-1.5 items-center justify-center rounded-lg border border-red-500 text-red-600 transition-colors hover:bg-red-50 text-xs font-semibold cursor-pointer"
      >
        {t('buyers.table.suspendSelected', 'Suspend Selected')}
      </button>

      <button
        onClick={clearSelection}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 cursor-pointer ms-1"
        aria-label={t('buyers.table.clearSelection', 'Clear selection')}
      >
        <X size={17} />
      </button>
    </div>
  );
}
