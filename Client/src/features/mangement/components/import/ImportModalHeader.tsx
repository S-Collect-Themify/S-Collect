import { useTranslation } from 'react-i18next';
import { X, FileSpreadsheet } from 'lucide-react';

interface ImportModalHeaderProps {
  onClose: () => void;
}

export default function ImportModalHeader({
  onClose,
}: ImportModalHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100/60">
            <FileSpreadsheet size={22} className="stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {t(
                'managementTable.importModal.title',
                'Import Products via Excel'
              )}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(
                'managementTable.importModal.subtitle',
                'Upload bulk products using the Excel spreadsheet template'
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
