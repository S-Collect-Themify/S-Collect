import { useTranslation } from 'react-i18next';
import { Download, Loader2, Info } from 'lucide-react';

interface ImportDownloadTemplateStepProps {
  onDownload: () => void;
  isDownloading: boolean;
}

export default function ImportDownloadTemplateStep({
  onDownload,
  isDownloading,
}: ImportDownloadTemplateStepProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Download size={16} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              {t(
                'managementTable.importModal.downloadTitle',
                'Step 1: Download the Template'
              )}
            </h4>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {t(
                'managementTable.importModal.downloadDesc',
                'Download the standard Excel file and fill it with your product rows.'
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isDownloading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} />
          )}
          <span>
            {isDownloading
              ? t('managementTable.importModal.downloading', 'Downloading...')
              : t(
                  'managementTable.importModal.downloadButton',
                  'Download Template (.xlsx)'
                )}
          </span>
        </button>
      </div>

      {/* Consecutive rows note */}
      <div className="mt-3 pt-3 border-t border-emerald-100/70 flex items-center gap-2 bg-emerald-50/70 rounded-lg p-2.5">
        <Info size={15} className="shrink-0 text-emerald-600" />
        <span className="text-[11px] sm:text-xs text-emerald-800 leading-relaxed">
          {t(
            'managementTable.importModal.groupingNotice',
            'Tip: Consecutive rows sharing the same name + nameAr + category are grouped as ONE product with multiple variants.'
          )}
        </span>
      </div>
    </div>
  );
}
