import { useTranslation } from 'react-i18next';
import { FileSpreadsheet } from 'lucide-react';
import { InventoryExportButton } from './InventoryExportButton';

interface InventoryHeaderProps {
  onExportAll?: () => void;
  onExportFiltered?: () => void;
  isExporting?: boolean;
  hasActiveFilter?: boolean;
  onOpenImportModal?: () => void;
}

export const InventoryHeader = ({
  onExportAll,
  onExportFiltered,
  isExporting = false,
  hasActiveFilter = false,
  onOpenImportModal,
}: InventoryHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-page-container-header flex items-center justify-between flex-wrap gap-4">
      <div>
        <h5 className="heading-page-title font-bold text-gray-900">
          {t('inventoryPage.title')}
        </h5>
        <p className="text-gray-500 py-2 ">{t('inventoryPage.subtitle')}</p>
      </div>
      <div className="flex items-center gap-2.5">
        {onOpenImportModal && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-2 text-sm font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors rounded-xl px-4 py-2.5 cursor-pointer shadow-xs select-none"
            title={t('inventoryPage.import', 'Import Inventory')}
          >
            <FileSpreadsheet size={18} className="text-emerald-600 shrink-0" />
            <span>{t('inventoryPage.import', 'Import')}</span>
          </button>
        )}
        {onExportAll && (
          <InventoryExportButton
            onExportAll={onExportAll}
            onExportFiltered={onExportFiltered || onExportAll}
            isExporting={isExporting}
            hasActiveFilter={hasActiveFilter}
          />
        )}
      </div>
    </div>
  );
};

export default InventoryHeader;


