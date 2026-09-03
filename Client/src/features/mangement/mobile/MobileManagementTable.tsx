import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import ProductCard from './ProductCard';
import { useManagementStore } from '../managementStore';
import {
  useManagementTable,
  useManagementActions,
} from '../useManagementHooks';
import CategoryDropdown from '../CategoryDropdown';
import StatusDropdown from '../StatusDropdown';
import { getPaginationRange } from '../../../utils/pagination';

export default function MobileManagementTable() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const {
    selectedCategories,
    selectedStatus,
    search,
    page,
    paginatedProducts,
    totalItems,
    totalPages,
    itemsPerPage,
    handleExport,
    isExporting,
  } = useManagementTable();
  const setSearch = useManagementStore((state) => state.setSearch);
  const setSelectedCategories = useManagementStore(
    (state) => state.setSelectedCategories
  );
  const setSelectedStatus = useManagementStore(
    (state) => state.setSelectedStatus
  );
  const setPage = useManagementStore((state) => state.setPage);

  const { toggleSingle, deleteSingle } = useManagementActions();

  return (
    <div className="font-sans text-gray-800" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 bg-white h-9 w-full">
          <i
            className="ti ti-search text-gray-400 text-base"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder={t('managementTable.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            <CategoryDropdown
              selected={selectedCategories}
              onChange={setSelectedCategories}
            />
            <StatusDropdown
              selected={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
            title={t('managementTable.export')}
          >
            {isExporting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>
              {isExporting
                ? t('managementTable.exporting')
                : t('managementTable.export')}
            </span>
          </button>
        </div>
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <i
            className="ti ti-package-off text-2xl block mb-2"
            aria-hidden="true"
          />
          <p>{t('managementTable.noProducts')}</p>
          <Link
            to="/add-product"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            {t('managementTable.addFirstProduct')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onToggle={() => toggleSingle(product.id, product.enabled)}
              onDelete={() => deleteSingle(product.id)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
        <span className="text-body-sm text-gray-400">
          {totalItems === 0
            ? t('managementTable.showing', {
                start: 0,
                end: 0,
                total: totalItems,
              })
            : t('managementTable.showing', {
                start: (page - 1) * itemsPerPage + 1,
                end: Math.min(page * itemsPerPage, totalItems),
                total: totalItems,
              })}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              aria-label="Previous Page"
            >
              {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {getPaginationRange(page, totalPages).map((item, index) =>
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
                  onClick={() => setPage(item)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                    item === page
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
              aria-label="Next Page"
            >
              {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
