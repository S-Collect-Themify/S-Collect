import { useState, useRef, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useInventoryImport } from '../hooks/useInventoryImport';
import { exportVendorInventory } from '../../../services/inventory';
import type { InventoryImportResponse } from '../../../services/inventory';

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportInventoryModal = ({
  isOpen,
  onClose,
}: ImportInventoryModalProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<InventoryImportResponse | null>(null);

  const importMutation = useInventoryImport();

  if (!isOpen) return null;

  const validateAndSetFile = (selectedFile: File) => {
    setFileError(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setFileError(
        t(
          'inventoryPage.importModal.invalidFileType',
          'Please select a valid Excel file (.xlsx or .xls)'
        )
      );
      return;
    }

    // 10MB file limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError(
        t(
          'inventoryPage.importModal.fileTooLarge',
          'File size must not exceed 10MB'
        )
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      await exportVendorInventory();
    } catch (err) {
      console.error('Failed to download inventory export sheet:', err);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImport = () => {
    if (!file) return;
    importMutation.mutate(file, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  const handleReset = () => {
    setFile(null);
    setFileError(null);
    setResult(null);
    importMutation.reset();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      dir={isAr ? 'rtl' : 'ltr'}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[92vh] border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {t(
                  'inventoryPage.importModal.title',
                  'Bulk Update Stock via Excel'
                )}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {t(
                  'inventoryPage.importModal.subtitle',
                  'Export your stock sheet, edit the yellow Stock column, and re-upload here.'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={t('common.close', 'Close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!result ? (
            <>
              {/* Step 1: Download current stock sheet */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      {t('inventoryPage.importModal.step1Tag', 'Step 1')}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {t(
                        'inventoryPage.importModal.step1Title',
                        'Download Current Inventory Sheet'
                      )}
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t(
                        'inventoryPage.importModal.step1Desc',
                        'The downloaded sheet has the Stock column highlighted in yellow with SUM formulas. Edit the stock quantities and upload below.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={isDownloadingTemplate}
                    className="shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white text-gray-800 border border-amber-300 hover:bg-amber-100/50 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isDownloadingTemplate ? (
                      <Loader2 size={15} className="animate-spin text-amber-600" />
                    ) : (
                      <Download size={15} className="text-amber-600" />
                    )}
                    <span>
                      {isDownloadingTemplate
                        ? t(
                            'inventoryPage.importModal.downloading',
                            'Downloading...'
                          )
                        : t(
                            'inventoryPage.importModal.downloadTemplate',
                            'Download Excel'
                          )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Step 2: Upload Dropzone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                    {t('inventoryPage.importModal.step2Tag', 'Step 2')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t(
                      'inventoryPage.importModal.fileTypesAllowed',
                      'XLSX, XLS up to 10MB'
                    )}
                  </span>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !file && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragOver
                      ? 'border-gray-900 bg-gray-50'
                      : fileError
                        ? 'border-red-300 bg-red-50/20'
                        : file
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-gray-200 hover:border-gray-400 bg-gray-50/30 cursor-pointer'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        validateAndSetFile(e.target.files[0]);
                      }
                    }}
                  />

                  {!file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {t(
                            'inventoryPage.importModal.dropzonePrompt',
                            'Click or drag your edited Excel file here'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {t(
                            'inventoryPage.importModal.dropzoneSub',
                            'Only variant rows that belong to your vendor account will be updated.'
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200 shadow-xs">
                      <div className="flex items-center gap-3 truncate text-start">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setFileError(null);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title={t('common.remove', 'Remove')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {fileError && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5 px-1 font-medium">
                    <AlertCircle size={14} />
                    {fileError}
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Results View after upload */
            <div className="space-y-4">
              {/* Summary Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  result.failed.length === 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : result.updated > 0
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                {result.failed.length === 0 ? (
                  <CheckCircle2
                    size={22}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                ) : result.updated > 0 ? (
                  <AlertTriangle
                    size={22}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                ) : (
                  <AlertCircle
                    size={22}
                    className="text-red-600 shrink-0 mt-0.5"
                  />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {result.failed.length === 0
                      ? t(
                          'inventoryPage.importModal.allSuccessTitle',
                          'Inventory Updated Successfully!'
                        )
                      : result.updated > 0
                        ? t(
                            'inventoryPage.importModal.partialSuccessTitle',
                            'Partially Updated'
                          )
                        : t(
                            'inventoryPage.importModal.failedTitle',
                            'Update Failed'
                          )}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-80 leading-relaxed">
                    {result.failed.length === 0
                      ? t(
                          'inventoryPage.importModal.allSuccessMsg',
                          'All variant stock quantities were updated in real time.'
                        )
                      : t(
                          'inventoryPage.importModal.partialSuccessMsg',
                          'Some variant rows could not be updated. Review the failed rows below.'
                        )}
                  </p>
                </div>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
                  <span className="text-2xl font-black text-emerald-600">
                    {result.updated}
                  </span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {t(
                      'inventoryPage.importModal.updatedCount',
                      'Variants Updated'
                    )}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-2xl border text-center ${
                    result.failed.length > 0
                      ? 'bg-red-50/50 border-red-100'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <span
                    className={`text-2xl font-black ${
                      result.failed.length > 0
                        ? 'text-red-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {result.failed.length}
                  </span>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    {t('inventoryPage.importModal.failedCount', 'Failed Rows')}
                  </p>
                </div>
              </div>

              {/* Failed Rows Detail Table */}
              {result.failed.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {t(
                      'inventoryPage.importModal.failedDetails',
                      'Failed Rows Details'
                    )}
                  </h5>
                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-xs text-start">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3 text-start font-semibold">
                            {t('inventoryPage.importModal.colRow', 'Row')}
                          </th>
                          <th className="py-2.5 px-3 text-start font-semibold">
                            {t('inventoryPage.colSku', 'SKU')}
                          </th>
                          <th className="py-2.5 px-3 text-start font-semibold">
                            {t(
                              'inventoryPage.importModal.colReason',
                              'Reason'
                            )}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {result.failed.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/60 transition-colors"
                          >
                            <td className="py-2 px-3 font-semibold text-gray-900 whitespace-nowrap">
                              {item.row}
                            </td>
                            <td className="py-2 px-3 text-gray-600 font-mono text-[11px] truncate max-w-[120px]">
                              {item.sku || item.variantId || '—'}
                            </td>
                            <td className="py-2 px-3 text-red-600 font-medium">
                              {item.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          {!result ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                disabled={importMutation.isPending}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!file || importMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>
                      {t(
                        'inventoryPage.importModal.uploading',
                        'Updating Stock...'
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>
                      {t(
                        'inventoryPage.importModal.submitUpload',
                        'Upload & Update'
                      )}
                    </span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={15} />
                <span>
                  {t(
                    'inventoryPage.importModal.uploadAnother',
                    'Upload Another File'
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors cursor-pointer"
              >
                {t('common.done', 'Done')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportInventoryModal;
