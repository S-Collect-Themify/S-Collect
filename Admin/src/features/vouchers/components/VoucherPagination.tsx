import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

interface VoucherPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const VoucherPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: VoucherPaginationProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const limit = itemsPerPage > 0 ? itemsPerPage : 20;

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  const paginationRange = getPaginationRange({
    currentPage,
    totalPages,
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white text-sm text-gray-500">
      {/* Item count summary */}
      <div>
        {t('vouchersListing.pagination.showing', {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous Page"
        >
          {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Page numbers & Ellipsis */}
        {paginationRange.map((pageItem, idx) => {
          if (pageItem === DOTS) {
            return (
              <span
                key={`dots-${idx}`}
                className="min-w-[32px] h-8 flex items-center justify-center text-sm text-gray-400 select-none tracking-widest px-1"
              >
                &#8230;
              </span>
            );
          }

          const pageNum = Number(pageItem);
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
                currentPage === pageNum
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next Page"
        >
          {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
};
