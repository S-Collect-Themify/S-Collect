// features/Inventory/InventoryDesktop.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useInventory } from './hooks/useInventory';
import { InventoryHeader } from './InventoryHeader';
import { InventoryToolbar } from './InventoryToolbar';
import { InventoryTable } from './InventoryTable';
import { InventoryPagination } from './InventoryPagination';
import { InventoryFooter } from './InventoryFooter';

const InventoryDesktop = () => {
  const {
    search,
    activeTab,
    currentPage,
    paginatedData,
    totalItems,
    totalPages,
    pageNumbers,
    handleFilterChange,
    handleSearchChange,
    handleStockChange,
    handlePageChange,
    handleSave,
  } = useInventory();

  return (
    <>
      <InventoryHeader />
      <div className="flex-1 overflow-y-auto bg-gray-100 sidebar-page-container">
        <InventoryToolbar
          search={search}
          activeTab={activeTab}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
        />
        <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 pb-4 px-4 pt-2 overflow-hidden">
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
              <InventoryTable
                data={paginatedData}
                onStockChange={handleStockChange}
              />
              <InventoryPagination
                currentPage={currentPage}
                totalItems={totalItems}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onPageChange={handlePageChange}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <InventoryFooter onSave={handleSave} />
      </div>
    </>
  );
};

export default InventoryDesktop;
