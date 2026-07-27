import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';

interface CommissionRatesHeaderProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

export default function CommissionRatesHeader({
  onExportExcel,
  onExportPDF,
}: CommissionRatesHeaderProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <div className="sidebar-page-container-header border-b border-gray-100/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('commissionRates.title', 'Commission Rates')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <PortalDropdown
            minWidth={185}
            align={isRtl ? 'left' : 'right'}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 z-50"
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gray-950 text-white text-xs sm:text-label-md font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
              >
                <Download size={16} />
                <span>{t('commissionRates.export', 'Export')}</span>
              </button>
            )}
          >
            {({ close }) => (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    onExportExcel();
                    close();
                  }}
                  className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet size={15} className="text-green-600 shrink-0" />
                  <span>{t('commissionRates.exportExcel', 'Export as Excel (.csv)')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPDF();
                    close();
                  }}
                  className="w-full flex items-center gap-2.5 text-start px-3.5 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <FileText size={15} className="text-rose-500 shrink-0" />
                  <span>{t('commissionRates.exportPdf', 'Export as PDF (.pdf)')}</span>
                </button>
              </div>
            )}
          </PortalDropdown>
        </div>
      </div>
    </div>
  );
}
