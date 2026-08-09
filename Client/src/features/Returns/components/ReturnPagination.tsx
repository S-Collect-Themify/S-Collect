import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getPaginationRange } from '../../../utils/pagination';

interface ReturnPaginationProps {
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  activePage: number;
  totalPages: number;
  pageNumbers?: number[];
  onPageChange: (page: number) => void;
}

export function ReturnPagination({
  filteredCount,
  startIndex,
  endIndex,
  activePage,
  totalPages,
  onPageChange,
}: ReturnPaginationProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500">
      <p className="font-semibold text-gray-600">
        {filteredCount > 0
          ? `${startIndex + 1} - ${endIndex} of ${filteredCount} return requests`
          : '0 return requests'}
      </p>

      {/* Dynamic Interactive Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          type="button"
          disabled={activePage === 1}
          onClick={() => onPageChange(Math.max(1, activePage - 1))}
          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Previous Page"
        >
          {isArabic ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Page Number Buttons / Ellipsis */}
        {getPaginationRange(activePage, totalPages).map((item, index) => {
          if (item === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-10 h-10 flex items-center justify-center text-xs text-gray-400 font-bold font-mono select-none"
              >
                ...
              </span>
            );
          }
          const isActive = item === activePage;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm font-mono transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-gray-950 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          disabled={activePage === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Next Page"
        >
          {isArabic ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}
