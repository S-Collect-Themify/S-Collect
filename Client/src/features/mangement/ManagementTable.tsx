import type { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Check } from 'lucide-react';
import ProductRow from './ProductRow';
import { showDeleteConfirmation } from './deleteConfirmation';
import { useManagementStore } from './managementStore';
import { useManagementTable, useManagementActions } from './useManagementHooks';
import CategoryDropdown from './CategoryDropdown';
import StatusDropdown from './StatusDropdown';

export default function ProductTable() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar'; // Detect language at table level

  const {
    selectedCategories,
    selectedStatus,
    search,
    page,
    selectedRows,
    paginatedProducts,
    totalItems,
    totalPages,
    selectedCount,
    allChecked,
    itemsPerPage,
  } = useManagementTable();
  const setSearch = useManagementStore((state) => state.setSearch);
  const setSelectedCategories = useManagementStore(
    (state) => state.setSelectedCategories
  );
  const setSelectedStatus = useManagementStore(
    (state) => state.setSelectedStatus
  );
  const setPage = useManagementStore((state) => state.setPage);
  const toggleRow = useManagementStore((state) => state.toggleRow);
  const setSelectedRows = useManagementStore((state) => state.setSelectedRows);
  const clearSelection = useManagementStore((state) => state.clearSelection);

  const {
    publishSelected,
    unpublishSelected,
    deleteSelected,
    deleteSingle,
    toggleSingle,
    isPending,
  } = useManagementActions();

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const handleDeleteSelected = () => {
    showDeleteConfirmation(
      'managementTable.deleteSelectedConfirmMessage',
      { count: selectedCount },
      deleteSelected
    );
  };

  const handlePublishSelected = () => {
    showDeleteConfirmation(
      'managementTable.publishSelectedConfirmMessage',
      { count: selectedCount },
      publishSelected,
      {
        titleKey: 'managementTable.publishConfirmTitle',
        confirmKey: 'managementTable.publish',
        confirmClassName: 'bg-green-600 hover:bg-green-700',
      }
    );
  };

  const handleUnpublishSelected = () => {
    showDeleteConfirmation(
      'managementTable.unpublishSelectedConfirmMessage',
      { count: selectedCount },
      unpublishSelected,
      {
        titleKey: 'managementTable.unpublishConfirmTitle',
        confirmKey: 'managementTable.unpublish',
        confirmClassName: 'bg-red-600 hover:bg-red-700',
        iconVariant: 'unpublish',
      }
    );
  };

  const toggleAll = (e: ChangeEvent<HTMLInputElement>) =>
    setSelectedRows(e.target.checked ? paginatedProducts.map((p) => p.id) : []);

  const tableHeaders = [
    t('managementTable.productName'),
    t('managementTable.category'),
    t('managementTable.price'),
    t('managementTable.rating'),
    t('managementTable.inventory'),
    t('managementTable.status'),
    t('managementTable.procedures'),
  ];

  return (
    <div className="flex flex-col flex-1 pb-10" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 mb-6 select-none flex-wrap">
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            className="w-full sm:w-48 pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-gray-900 focus:bg-white placeholder:text-gray-400 transition-colors"
            placeholder={t('managementTable.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
        </div>

        <CategoryDropdown
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />

        <StatusDropdown
          selected={selectedStatus}
          onChange={setSelectedStatus}
        />

        {selectedCount > 0 && (
          <div className="flex items-center gap-1 sm:ml-auto select-none sm:order-last order-first w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-body-sm text-gray-400 font-bold px-2 py-1 rounded bg-gray-100 flex items-center gap-2.5">
              <span>{t('managementTable.selectedCount', { count: selectedCount })}</span>
              <button
                onClick={clearSelection}
                className="cursor-pointer hover:bg-gray-200 rounded p-0.5"
                title={t('managementTable.clearSelection')}
              >
                <X size={14} color="gray" />
              </button>
            </span>
            <div className="flex gap-2">
              <button
                disabled={isPending}
                className="flex items-center gap-1.5 h-9 px-3 border border-red-200 text-red-600 rounded-lg bg-red-50 text-sm cursor-pointer hover:bg-red-100 whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteSelected}
              >
                {t('managementTable.deleteSelected')}
              </button>
              <button
                disabled={isPending}
                className="flex items-center gap-1.5 h-9 px-3 border border-green-200 text-green-700 rounded-lg bg-green-50 text-sm cursor-pointer hover:bg-green-100 whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handlePublishSelected}
              >
                {t('managementTable.publishSelected')}
              </button>
              <button
                disabled={isPending}
                className="flex items-center gap-1.5 h-9 px-3 border border-amber-200 text-amber-700 rounded-lg bg-amber-50 text-sm cursor-pointer hover:bg-amber-100 whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUnpublishSelected}
              >
                {t('managementTable.unpublishSelected')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-x-auto select-none bg-white rounded-xl border border-gray-100">
        <table className="w-full min-w-[900px] border-collapse text-start">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 select-none">
              <th className="w-12 px-3 py-3 text-start">
                <label className="inline-flex items-center justify-center w-4 h-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="peer sr-only"
                  />
                  <span
                    className="w-4 h-4 rounded-[4px] border border-gray-300 bg-white
                               flex items-center justify-center
                               peer-checked:bg-gray-900 peer-checked:border-gray-900
                               transition-colors"
                  >
                    {allChecked && (
                      <Check className="text-white" size={11} strokeWidth={3} />
                    )}
                  </span>
                </label>
              </th>
              {tableHeaders.map((header) => (
                <th
                  key={header}
                  className="px-3 py-3 text-body-sm font-bold text-gray-500 uppercase tracking-wider text-start"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 select-none">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length + 1} className="py-12 text-center text-gray-400">
                  <span
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
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  selected={selectedRows.includes(product.id)}
                  onSelect={() => toggleRow(product.id)}
                  onDelete={() => deleteSingle(product.id)}
                  onToggle={() => toggleSingle(product.id, product.enabled)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

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
          <div className="flex gap-1">
            {pageNumbers.map((n) => (
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
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        /* Replaced left-1/2 and -translate-x-1/2 with logical positioning */
        <div className="fixed left-1/2 bottom-6 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-black text-sm font-semibold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
            {t('managementTable.selectedProducts', { count: selectedCount })}
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={handlePublishSelected}
            className="flex px-3.5 py-1 items-center justify-center rounded-md border border-green-600 text-green-600 transition-colors hover:bg-green-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('managementTable.publishSelected')}
          >
            {t('managementTable.publish')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleUnpublishSelected}
            className="flex px-3.5 py-1 items-center justify-center rounded-md border border-black text-black transition-colors hover:bg-gray-100 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('managementTable.unpublishSelected')}
          >
            {t('managementTable.unpublish')}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteSelected}
            className="flex px-3.5 py-1 items-center justify-center rounded-md border border-red-600 text-white bg-red-600 hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('managementTable.deleteSelected')}
          >
            {t('managementTable.delete')}
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label={t('managementTable.clearSelection')}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
