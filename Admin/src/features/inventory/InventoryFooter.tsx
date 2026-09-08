import { useTranslation } from 'react-i18next';

interface InventoryFooterProps {
  onSave: () => void;
  isSaving?: boolean;
}

export const InventoryFooter = ({ onSave, isSaving }: InventoryFooterProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex justify-end mt-5">
      <button
        onClick={onSave}
        disabled={isSaving}
        className="bg-gray-900 text-gray-50 px-6 py-2.5 rounded-lg text-label-md font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors cursor-pointer select-none"
      >
        {isSaving ? '...' : t('inventoryPage.saveChanges')}
      </button>
    </div>
  );
};
