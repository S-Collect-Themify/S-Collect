import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import type { VendorTab } from '../types/vendors';

type ModalType = 'approve' | 'reject' | 'deactivate';

interface VendorBulkActionBarProps {
  selectedCount: number;
  selectedRows: string[];
  activeTab: VendorTab;
  openConfirm: (type: ModalType, ids: string[]) => void;
  clearSelection: () => void;
}

export default function VendorBulkActionBar({
  selectedCount,
  selectedRows,
  activeTab,
  openConfirm,
  clearSelection,
}: VendorBulkActionBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="fixed left-1/2 bottom-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-gray-900 text-sm font-semibold">
        {selectedCount}
      </div>
      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
        {t('vendors.table.selected', { count: selectedCount })}
      </span>

      {activeTab === 'pending' && (
        <>
          <button
            onClick={() => openConfirm('approve', selectedRows)}
            className="flex px-3.5 py-1 items-center justify-center rounded-md border border-green-600 text-green-600 transition-colors hover:bg-green-50 text-sm font-medium"
          >
            {t('vendors.table.approveSelected')}
          </button>
          <button
            onClick={() => openConfirm('reject', selectedRows)}
            className="flex px-3.5 py-1 items-center justify-center rounded-md border border-red-500 text-red-500 transition-colors hover:bg-red-50 text-sm font-medium"
          >
            {t('vendors.table.rejectSelected')}
          </button>
        </>
      )}

      {activeTab === 'all' && (
        <button
          onClick={() => openConfirm('deactivate', selectedRows)}
          className="flex px-3.5 py-1 items-center justify-center rounded-md border border-red-500 text-red-600 transition-colors hover:bg-red-50 text-sm font-medium"
        >
          {t('vendors.table.deactivateSelected')}
        </button>
      )}

      {activeTab === 'suspended' && (
        <button
          onClick={() => openConfirm('approve', selectedRows)}
          className="flex px-3.5 py-1 items-center justify-center rounded-md border border-green-600 text-green-600 transition-colors hover:bg-green-50 text-sm font-medium"
        >
          {t('vendors.table.approveSelected')}
        </button>
      )}

      <button
        onClick={clearSelection}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100"
        aria-label={t('vendors.table.clearSelection')}
      >
        <X size={17} />
      </button>
    </div>
  );
}
