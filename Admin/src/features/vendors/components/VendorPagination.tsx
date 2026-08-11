import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

interface VendorPaginationProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  isRtl: boolean;
}

export default function VendorPagination({
  startItem,
  endItem,
  totalItems,
  page,
  totalPages,
  setPage,
  isRtl,
}: VendorPaginationProps) {
  const { t } = useTranslation();

  if (totalItems === 0 || totalPages <= 1) return null;

  const paginationRange = getPaginationRange({
    currentPage: page,
    totalPages,
  });

  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <span className="text-xs text-gray-700">
        {t('vendors.table.showing', {
          start: startItem,
          end: endItem,
          total: totalItems,
        })}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
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

            const n = Number(pageItem);
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                  n === page
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
