import { useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

interface InventoryImportButtonProps {
  onImport: (file: File) => void;
  isImporting: boolean;
  className?: string;
  iconSize?: number;
}

const ACCEPT =
  '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';

const VALID_EXT = /\.(xlsx|xls|csv)$/i;

export const InventoryImportButton = ({
  onImport,
  isImporting,
  className = '',
  iconSize = 15,
}: InventoryImportButtonProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange
    e.target.value = '';
    if (!file) return;
    if (!VALID_EXT.test(file.name)) {
      toast.error(
        t('inventoryPage.importInvalidType', 'Please choose an Excel or CSV file.')
      );
      return;
    }
    onImport(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isImporting}
        className={className}
      >
        <Upload size={iconSize} className="shrink-0" />
        {isImporting
          ? t('inventoryPage.importing', 'Importing...')
          : t('inventoryPage.import', 'Import')}
      </button>
    </>
  );
};

export default InventoryImportButton;
