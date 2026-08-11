import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransactionStore } from '../../../store/transactionStore';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

interface TransactionsPaginationProps {
  totalItems: number;
  itemsPerPage: number;
}

export const TransactionsPagination: React.FC<TransactionsPaginationProps> = ({
  totalItems,
  itemsPerPage,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { page, setPage } = useTransactionStore();

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  if (totalItems <= itemsPerPage || totalPages <= 1) return null;

  const startItem = (safePage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safePage * itemsPerPage, totalItems);

  const paginationRange = getPaginationRange({
    currentPage: safePage,
    totalPages,
  });

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-xs text-gray-700">
        {t('dashboardOverview.transactionsLog.showingCount', {
          start: startItem,
          end: endItem,
          total: totalItems,
          defaultValue: `Showing ${startItem} - ${endItem} of ${totalItems} transactions`,
        })}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={safePage === 1}
          onClick={() => setPage(safePage - 1)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isRtl ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>

        {paginationRange.map((pageItem, idx) => {
          if (pageItem === DOTS) {
            return (
              <span
                key={`dots-${idx}`}
                className="inline-flex items-center justify-center h-8 w-8 text-xs text-gray-400 select-none tracking-widest"
              >
                &#8230;
              </span>
            );
          }

          const n = Number(pageItem);
          return (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                n === safePage
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {n}
            </button>
          );
        })}

        <button
          type="button"
          disabled={safePage === totalPages}
          onClick={() => setPage(safePage + 1)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </div>
  );
};
