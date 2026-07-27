import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
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
  itemsPerPage,
  onPageChange,
}: PaginationProps) => {
  const { t } = useTranslation();

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <>
      {totalPages > 1 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100"
        >
          <span className="text-body-sm text-gray-400">
            {t('ordersPage.showing')} {(currentPage - 1) * itemsPerPage + 1} –{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)}{' '}
            {t('ordersPage.of')} {totalItems} {t('ordersPage.results')}
          </span>
          <div className="flex gap-1">
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                  n === currentPage
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100"
        >
          <span className="text-body-sm text-gray-400">
            {t('ordersPage.showing')} 1 – {totalItems} {t('ordersPage.of')}{' '}
            {totalItems} {t('ordersPage.results')}
          </span>
        </motion.div>
      )}
    </>
  );
};
