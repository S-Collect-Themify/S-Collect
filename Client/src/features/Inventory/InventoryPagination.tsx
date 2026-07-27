// features/Inventory/InventoryPagination.tsx
import { useTranslation } from 'react-i18next';
import { ITEMS_PER_PAGE } from './types';

interface InventoryPaginationProps {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
}

export const InventoryPagination = ({
  currentPage,
  totalItems,
  totalPages,
  pageNumbers,
  onPageChange,
}: InventoryPaginationProps) => {
  const { t } = useTranslation();

  const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
      <span className="text-body-sm text-gray-400">
        {t('inventoryPage.showing')} {start} – {end} {t('inventoryPage.of')}{' '}
        {totalItems} {t('inventoryPage.results')}
      </span>
      {totalPages > 1 && (
        <div className="flex gap-1">
          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => onPageChange(n)}
              className={`w-8 h-8 rounded-lg text-label-md border transition-colors ${
                n === currentPage
                  ? 'bg-gray-900 text-gray-50 border-gray-900'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
