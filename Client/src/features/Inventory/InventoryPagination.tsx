// features/Inventory/InventoryPagination.tsx
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ITEMS_PER_PAGE } from './types';
import { getPaginationRange } from '../../utils/pagination';

interface InventoryPaginationProps {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageNumbers?: number[];
  onPageChange: (page: number) => void;
}

export const InventoryPagination = ({
  currentPage,
  totalItems,
  totalPages,
  onPageChange,
}: InventoryPaginationProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
      <span className="text-body-sm text-gray-400">
        {t('inventoryPage.showing')} {start} – {end} {t('inventoryPage.of')}{' '}
        {totalItems} {t('inventoryPage.results')}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            aria-label="Previous Page"
          >
            {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {getPaginationRange(currentPage, totalPages).map((item, index) =>
            item === '...' ? (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                onClick={() => onPageChange(item)}
                className={`w-8 h-8 rounded-lg text-label-md border transition-colors ${
                  item === currentPage
                    ? 'bg-gray-900 text-gray-50 border-gray-900'
                    : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {item}
              </button>
            )
          )}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            aria-label="Next Page"
          >
            {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      )}
    </div>
  );
};
