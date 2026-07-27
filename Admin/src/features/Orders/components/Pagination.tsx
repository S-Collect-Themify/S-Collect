import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isMobile = false,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (totalItems <= itemsPerPage || totalPages <= 1) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  if (isMobile) {
    return (
      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-xs text-gray-500 font-medium">
          {t('ordersPage.showingItems', 'Showing {{start}}-{{end}} of {{total}} items', {
            start: startItem,
            end: endItem,
            total: totalItems,
          })}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <PrevIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <NextIcon size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
      <span className="text-xs sm:text-sm text-gray-500 font-medium">
        {t('ordersPage.showingItems', 'Showing {{start}}-{{end}} of {{total}} items', {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <PrevIcon size={16} />
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => {
          const pageNum = idx + 1;
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-black text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <NextIcon size={16} />
        </button>
      </div>
    </div>
  );
};