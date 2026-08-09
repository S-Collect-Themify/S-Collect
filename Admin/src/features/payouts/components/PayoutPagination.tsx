import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

interface PayoutPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function PayoutPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PayoutPaginationProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (totalItems <= itemsPerPage || totalPages <= 1) return null;

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  const paginationRange = getPaginationRange({
    currentPage,
    totalPages,
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 bg-white border-t border-gray-100 text-xs">
      <div className="text-gray-400 font-medium text-center sm:text-start">
        {t('payouts.showingCount', 'Showing {{start}} - {{end}} of {{total}} vendors', {
          start: startIndex,
          end: endIndex,
          total: totalItems,
        })}
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Page Number Buttons & Ellipsis */}
        {paginationRange.map((pageItem, idx) => {
          if (pageItem === DOTS) {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 select-none tracking-widest"
              >
                &#8230;
              </span>
            );
          }

          const pageNum = Number(pageItem);
          const isActive = pageNum === currentPage;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-black text-white shadow-2xs'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Page */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </div>
  );
}
