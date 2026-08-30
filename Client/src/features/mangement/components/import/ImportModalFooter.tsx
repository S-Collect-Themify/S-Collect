import { useTranslation } from 'react-i18next';
import { Upload, Loader2, RefreshCw } from 'lucide-react';
import type { ProductImportResponse } from '../../../../services/products';

interface ImportModalFooterProps {
  result: ProductImportResponse | null;
  file: File | null;
  isImportPending: boolean;
  onClose: () => void;
  onImport: () => void;
  onReset: () => void;
}

export default function ImportModalFooter({
  result,
  file,
  isImportPending,
  onClose,
  onImport,
  onReset,
}: ImportModalFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
      {!result ? (
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isImportPending}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t('managementTable.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={!file || isImportPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isImportPending ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>
                  {t(
                    'managementTable.importModal.importing',
                    'Importing products...'
                  )}
                </span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>
                  {t(
                    'managementTable.importModal.importButton',
                    'Upload & Import'
                  )}
                </span>
              </>
            )}
          </button>
        </>
      ) : (
        <div className="flex items-center justify-end w-full gap-3">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>
              {t(
                'managementTable.importModal.importAnother',
                'Import Another File'
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-xs"
          >
            {t('managementTable.importModal.done', 'Done')}
          </button>
        </div>
      )}
    </div>
  );
}
