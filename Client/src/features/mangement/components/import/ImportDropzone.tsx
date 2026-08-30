import { useRef, type DragEvent, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileCheck, X, AlertCircle } from 'lucide-react';

interface ImportDropzoneProps {
  file: File | null;
  dragOver: boolean;
  fileError: string | null;
  isPending: boolean;
  onFileSelect: (file: File) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onRemoveFile: () => void;
}

export default function ImportDropzone({
  file,
  dragOver,
  fileError,
  isPending,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
}: ImportDropzoneProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {t(
          'managementTable.importModal.uploadTitle',
          'Step 2: Upload Filled Excel File'
        )}
      </label>

      {!file ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/10'
              : 'border-gray-200 bg-gray-50/60 hover:bg-gray-50 hover:border-gray-300'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
            <Upload size={22} className="stroke-[2.2]" />
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {t(
              'managementTable.importModal.dropzonePrompt',
              'Click to browse or drag and drop your file here'
            )}
          </p>
          <p className="text-xs text-gray-400">
            {t(
              'managementTable.importModal.dropzoneSub',
              'Supports Microsoft Excel (.xlsx, .xls) up to 10MB'
            )}
          </p>
        </div>
      ) : (
        <div className="border border-emerald-200 bg-emerald-50/20 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileCheck size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                {file.name}
              </p>
              <p className="text-[11px] text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveFile}
            disabled={isPending}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
            title={t('managementTable.importModal.removeFile', 'Remove file')}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {fileError && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
          <AlertCircle size={15} className="shrink-0" />
          <span>{fileError}</span>
        </div>
      )}
    </div>
  );
}
