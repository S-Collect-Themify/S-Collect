import { useTranslation } from 'react-i18next';
import { Download, Loader2, ChevronDown, Layers, Filter } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';

interface InventoryExportButtonProps {
  onExportAll: () => void;
  onExportFiltered: () => void;
  isExporting: boolean;
  hasActiveFilter: boolean;
  isMobile?: boolean;
}

export const InventoryExportButton = ({
  onExportAll,
  onExportFiltered,
  isExporting,
  hasActiveFilter,
  isMobile = false,
}: InventoryExportButtonProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const baseButtonClass = isMobile
    ? 'flex items-center gap-1.5 text-xs font-semibold bg-gray-900 hover:bg-gray-800 text-white active:bg-gray-950 transition-all rounded-lg px-3 py-2 cursor-pointer shadow-xs disabled:opacity-50 select-none'
    : 'flex items-center gap-2 text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white active:bg-gray-950 transition-all rounded-xl px-4 py-2.5 cursor-pointer shadow-xs disabled:opacity-50 select-none';

  if (!hasActiveFilter) {
    return (
      <button
        type="button"
        onClick={onExportAll}
        disabled={isExporting}
        className={baseButtonClass}
        title={t('inventoryPage.exportAllVariants', 'Export All Variants')}
        aria-label={t('inventoryPage.exportAllVariants', 'Export All Variants')}
      >
        {isExporting ? (
          <Loader2 size={isMobile ? 14 : 18} className="animate-spin" />
        ) : (
          <Download size={isMobile ? 14 : 18} />
        )}
        <span>
          {isExporting
            ? t('inventoryPage.exporting', 'Exporting...')
            : t('inventoryPage.export', 'Export')}
        </span>
      </button>
    );
  }

  return (
    <PortalDropdown
      align={isAr ? 'left' : 'right'}
      minWidth={210}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 overflow-hidden z-50"
      trigger={({ isOpen, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          disabled={isExporting}
          className={`${baseButtonClass} ${isOpen ? 'ring-2 ring-gray-400' : ''}`}
          aria-expanded={isOpen}
          title={t('inventoryPage.exportVariants', 'Export Inventory')}
        >
          {isExporting ? (
            <Loader2 size={isMobile ? 14 : 18} className="animate-spin" />
          ) : (
            <Download size={isMobile ? 14 : 18} />
          )}
          <span>
            {isExporting
              ? t('inventoryPage.exporting', 'Exporting...')
              : t('inventoryPage.export', 'Export')}
          </span>
          <ChevronDown
            size={isMobile ? 12 : 14}
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <div className="flex flex-col gap-1 text-start">
          <button
            type="button"
            onClick={() => {
              close();
              onExportAll();
            }}
            disabled={isExporting}
            className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full text-start"
          >
            <Layers size={16} className="text-gray-500 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {t('inventoryPage.exportAllVariants', 'Export All Variants')}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              close();
              onExportFiltered();
            }}
            disabled={isExporting}
            className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-950 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer w-full text-start"
          >
            <Filter size={16} className="text-blue-600 shrink-0" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {t(
                  'inventoryPage.exportFilteredVariants',
                  'Export Filtered Variants'
                )}
              </span>
            </div>
          </button>
        </div>
      )}
    </PortalDropdown>
  );
};

export default InventoryExportButton;
