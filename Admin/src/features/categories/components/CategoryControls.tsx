import { ChevronLeft, ChevronRight, Trash2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { getPaginationRange, DOTS } from '../../../utils/pagination';

// ─── Pagination ────────────────────────────────────────────────────────────────
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 20,
  onPageChange,
}: PaginationProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (totalItems <= 0) return null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  const paginationRange = getPaginationRange({
    currentPage,
    totalPages: Math.max(1, totalPages),
  });

  return (
    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-xs text-gray-700">
        {t('categories.pagination.showing', { start, end, total: totalItems })}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
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

          const pageNum = Number(pageItem);
          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                pageNum === currentPage
                  ? 'bg-gray-950 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isRtl ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>
    </div>
  );
};

// ─── Bulk Action Navbar ────────────────────────────────────────────────────────
export interface BulkNavbarProps {
  selectedCount: number;
  onDelete: () => void;
  onApplyDiscount?: () => void;
  onClearSelection: () => void;
}

export const BulkNavbar = ({
  selectedCount,
  onDelete,
  onApplyDiscount,
  onClearSelection,
}: BulkNavbarProps) => {
  const { t, i18n } = useTranslation();

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="bulk-navbar"
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md sm:w-auto"
        >
          <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3 bg-gray-950 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-2xl shadow-2xl shadow-black/30 border border-white/10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/15 text-xs font-bold shrink-0">
                {selectedCount}
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/80 truncate">
                {selectedCount === 1
                  ? t('categories.bulk.selectedCount', { count: selectedCount })
                  : t('categories.bulk.selectedCountPlural', { count: selectedCount })}
              </span>
            </div>

            <div className="w-px h-5 bg-white/20 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedCount === 1 && onApplyDiscount && (
                <button
                  type="button"
                  onClick={onApplyDiscount}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white text-gray-950 text-xs sm:text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Tag size={14} />
                  <span>{i18n.language === 'ar' ? 'خصم جماعي' : 'Bulk Discount'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-red text-white text-xs sm:text-sm font-semibold hover:bg-red/90 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Trash2 size={14} />
                <span>{t('categories.bulk.deleteSingle')}</span>
              </button>

              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
                title={t('categories.bulk.clearSelection')}
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
