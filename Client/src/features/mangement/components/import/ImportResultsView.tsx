import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import type { ProductImportResponse } from '../../../../services/products';

interface ImportResultsViewProps {
  result: ProductImportResponse;
}

export default function ImportResultsView({ result }: ImportResultsViewProps) {
  const { t } = useTranslation();

  const isFullSuccess = result.failed.length === 0;
  const isPartialSuccess = result.created > 0 && result.failed.length > 0;

  const formatImportError = (err: string) => {
    switch (err) {
      case 'catalog.SKU_TAKEN':
      case 'SKU_TAKEN':
        return t(
          'managementTable.importModal.errors.skuTaken',
          'This SKU is already in use by another product.'
        );
      case 'catalog.CATEGORY_NOT_FOUND':
      case 'CATEGORY_NOT_FOUND':
        return t(
          'managementTable.importModal.errors.categoryNotFound',
          'Category not found. Please verify category name from the Categories sheet.'
        );
      case 'catalog.INVALID_IMAGE_URL':
        return t(
          'managementTable.importModal.errors.invalidImageUrl',
          'Image URL is invalid or unreachable.'
        );
      default:
        return err;
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Header Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3 ${
          isFullSuccess
            ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
            : isPartialSuccess
            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
            : 'bg-red-50/60 border-red-200 text-red-900'
        }`}
      >
        {isFullSuccess ? (
          <CheckCircle2
            size={20}
            className="text-emerald-600 shrink-0 mt-0.5"
          />
        ) : isPartialSuccess ? (
          <AlertTriangle
            size={20}
            className="text-amber-600 shrink-0 mt-0.5"
          />
        ) : (
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-bold">
            {result.summary ||
              t(
                'managementTable.importModal.importComplete',
                'Import Completed'
              )}
          </h4>
          <p className="text-xs mt-0.5 opacity-80">
            {isFullSuccess
              ? t(
                  'managementTable.importModal.allSuccess',
                  'All products have been created successfully.'
                )
              : t(
                  'managementTable.importModal.partialSuccess',
                  'Some items could not be imported. Check the details below.'
                )}
          </p>
        </div>
      </div>

      {/* Stat Counters */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 text-center">
          <span className="text-2xl font-black text-emerald-600">
            {result.created}
          </span>
          <p className="text-xs font-semibold text-gray-700 mt-1">
            {t(
              'managementTable.importModal.createdCount',
              'Products Created'
            )}
          </p>
        </div>
        <div
          className={`p-4 rounded-2xl border text-center ${
            result.failed.length > 0
              ? 'bg-red-50/40 border-red-100 text-red-600'
              : 'bg-gray-50 border-gray-100 text-gray-400'
          }`}
        >
          <span className="text-2xl font-black">{result.failed.length}</span>
          <p className="text-xs font-semibold text-gray-700 mt-1">
            {t('managementTable.importModal.failedCount', 'Failed Items')}
          </p>
        </div>
      </div>

      {/* Failed Items List */}
      {result.failed.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {t(
              'managementTable.importModal.failureDetails',
              'Failed Items Breakdown'
            )}
          </h5>
          <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
            {result.failed.map((failItem, idx) => (
              <div
                key={idx}
                className="p-3 bg-red-50/30 rounded-xl border border-red-100/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {failItem.product ||
                      t(
                        'managementTable.importModal.unnamedProduct',
                        'Unnamed Product'
                      )}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-mono text-[11px] font-medium">
                    {t('managementTable.importModal.rows', 'Rows')}:{' '}
                    {failItem.rows?.join(', ') || '-'}
                  </span>
                </div>
                {failItem.error && (
                  <p className="text-red-600 text-[11px] font-medium leading-relaxed">
                    {formatImportError(failItem.error)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
