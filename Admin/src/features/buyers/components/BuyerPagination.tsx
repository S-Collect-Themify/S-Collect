import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BuyerPaginationProps {
  startItem: number;
  endItem: number;
  totalItems: number;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  isRtl: boolean;
}

export default function BuyerPagination({
  startItem,
  endItem,
  totalItems,
  page,
  totalPages,
  setPage,
  isRtl,
}: BuyerPaginationProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
      <span className="text-xs text-gray-400">
        {t('buyers.table.showing', {
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
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                n === page
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {n}
            </button>
          ))}
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
