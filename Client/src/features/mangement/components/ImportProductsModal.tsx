import { useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useImportProducts,
  useDownloadImportTemplate,
} from '../useManagementHooks';
import type { ProductImportResponse } from '../../../services/products';

import ImportModalHeader from './import/ImportModalHeader';
import ImportDownloadTemplateStep from './import/ImportDownloadTemplateStep';
import ImportDropzone from './import/ImportDropzone';
import ImportResultsView from './import/ImportResultsView';
import ImportModalFooter from './import/ImportModalFooter';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportProductsModal({
  isOpen,
  onClose,
}: ImportProductsModalProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductImportResponse | null>(null);

  const downloadMutation = useDownloadImportTemplate();
  const importMutation = useImportProducts();

  if (!isOpen) return null;

  const validateAndSetFile = (selectedFile: File) => {
    setFileError(null);
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      setFileError(
        t(
          'managementTable.importModal.invalidFileType',
          'Please select a valid Excel file (.xlsx or .xls)'
        )
      );
      return;
    }

    // Max 10MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileError(
        t(
          'managementTable.importModal.fileTooLarge',
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

  const handleRemoveFile = () => {
    setFile(null);
    setFileError(null);
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
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      dir={isArabic ? 'rtl' : 'ltr'}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up my-8 relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <ImportModalHeader onClose={handleClose} />

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!result ? (
            <>
              {/* Step 1: Download Template */}
              <ImportDownloadTemplateStep
                onDownload={() => downloadMutation.mutate()}
                isDownloading={downloadMutation.isPending}
              />

              {/* Step 2: Upload Dropzone */}
              <ImportDropzone
                file={file}
                dragOver={dragOver}
                fileError={fileError}
                isPending={importMutation.isPending}
                onFileSelect={validateAndSetFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onRemoveFile={handleRemoveFile}
              />
            </>
          ) : (
            /* Result Summary View */
            <ImportResultsView result={result} />
          )}
        </div>

        {/* Modal Footer with Actions */}
        <ImportModalFooter
          result={result}
          file={file}
          isImportPending={importMutation.isPending}
          onClose={handleClose}
          onImport={handleImport}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
