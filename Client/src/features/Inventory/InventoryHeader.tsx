import { useTranslation } from 'react-i18next';
import { InventoryExportButton } from './InventoryExportButton';

interface InventoryHeaderProps {
  onExportAll?: () => void;
  onExportFiltered?: () => void;
  isExporting?: boolean;
  hasActiveFilter?: boolean;
}

export const InventoryHeader = ({
  onExportAll,
  onExportFiltered,
  isExporting = false,
  hasActiveFilter = false,
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
      {onExportAll && (
        <InventoryExportButton
          onExportAll={onExportAll}
          onExportFiltered={onExportFiltered || onExportAll}
          isExporting={isExporting}
          hasActiveFilter={hasActiveFilter}
        />
      )}
    </div>
  );
};

export default InventoryHeader;

