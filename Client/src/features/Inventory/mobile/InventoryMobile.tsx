import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileSpreadsheet } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { ProductCard } from './ProductCard';
import { MobileFilter } from './MobileFilter';
import { ITEMS_PER_PAGE } from '../types';
import { InventoryExportButton } from '../InventoryExportButton';
import { ImportInventoryModal } from '../components/ImportInventoryModal';

export const InventoryMobile = () => {
  const { t } = useTranslation();
  const {
    search,
    activeTab,
    currentPage,
    paginatedData,
    totalItems,
    totalPages,
    pageNumbers,
    handleSearchChange,
    handleFilterChange,
    handleStockChange,
    handlePageChange,
    handleSave,
    handleExportAll,
    handleExportFiltered,
    isExporting,
    hasActiveFilter,
    isImportModalOpen,
    openImportModal,
    closeImportModal,
  } = useInventory();

  const start = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    // pb-20 leaves room for the sticky Save button
    <div className="flex flex-col min-h-screen bg-gray-100 pb-20">
      <div className="px-4 pt-5 pb-4">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {t('inventoryPage.title', 'Inventory Management')}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {t(
                'inventoryPage.subtitle',
                'Keep your stock quantities updated in real time.'
              )}
            </p>
          </div>
          <div className="shrink-0 mt-0.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={openImportModal}
              className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-all rounded-lg px-2.5 py-2 cursor-pointer shadow-xs select-none"
              title={t('inventoryPage.import', 'Import Inventory')}
            >
              <FileSpreadsheet size={14} className="text-emerald-600 shrink-0" />
              <span>{t('inventoryPage.import', 'Import')}</span>
            </button>
            <InventoryExportButton
              onExportAll={handleExportAll}
              onExportFiltered={handleExportFiltered}
              isExporting={isExporting}
              hasActiveFilter={hasActiveFilter}
              isMobile={true}
            />
          </div>
        </div>

        {/* Search + filter tabs */}
        <MobileFilter
          search={search}
          activeTab={activeTab}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
        />

        {/* Cards list with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${currentPage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.15,
              ease: 'easeOut',
            }}
          >
            {paginatedData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center text-gray-400 text-sm"
              >
                {t('inventoryPage.noProducts', 'No products found.')}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {paginatedData.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.04,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <ProductCard
                      product={product}
                      onStockChange={handleStockChange}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200">
                <span className="text-body-sm text-gray-400">
                  {t('inventoryPage.showing', 'Showing')} {start}–{end}{' '}
                  {t('inventoryPage.of', 'of')} {totalItems}
                </span>

                {totalPages > 1 && (
                  <div className="flex gap-1.5">
                    {pageNumbers.map((n) => (
                      <button
                        key={n}
                        onClick={() => handlePageChange(n)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium border transition-colors ${
                          n === currentPage
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky Save Changes button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 active:scale-[0.98]"
        >
          {t('inventoryPage.saveChanges', 'Save Changes')}
        </button>
      </div>

      <ImportInventoryModal
        isOpen={isImportModalOpen}
        onClose={closeImportModal}
      />
    </div>
  );
};

