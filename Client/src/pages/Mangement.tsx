import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ManagementTable from '../features/mangement/ManagementTable';
import MobileManagementTable from '../features/mangement/mobile/MobileManagementTable';
import ImportProductsModal from '../features/mangement/components/ImportProductsModal';
import BulkDiscountModal from '../features/mangement/components/BulkDiscountModal';
import { useManagementStore } from '../features/mangement/managementStore';
import { useBulkDiscount } from '../features/mangement/useManagementHooks';
import { Link } from 'react-router-dom';
import { PlusIcon, FileSpreadsheet } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { motion } from 'motion/react';

import { containerVariants, itemVariants } from '../utils/animations';

const Management = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const isBulkDiscountModalOpen = useManagementStore(
    (state) => state.isBulkDiscountModalOpen
  );
  const closeBulkDiscountModal = useManagementStore(
    (state) => state.closeBulkDiscountModal
  );
  const selectedRows = useManagementStore((state) => state.selectedRows);
  const bulkDiscountMutation = useBulkDiscount();

  return (
    <>
      <div className="sidebar-page-container-header flex items-center justify-between bg-gray-50">
        <h1 className="heading-page-title">{t('managementTable.title')}</h1>
        <div className="flex items-center gap-2.5">
          {isMobile ? (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center justify-center bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors rounded-full p-2 cursor-pointer shadow-xs"
                title={t('managementTable.importProducts', 'Import Products')}
                aria-label={t(
                  'managementTable.importProducts',
                  'Import Products'
                )}
              >
                <FileSpreadsheet size={20} />
              </button>
              <Link
                to={'/add-product'}
                className="flex items-center gap-2 text-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors rounded-full p-2 shadow-xs"
                aria-label={t('Add Product')}
              >
                <PlusIcon size={20} />
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors rounded-xl px-4 py-2.5 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <span>
                  {t('managementTable.importProducts', 'Import Products')}
                </span>
              </button>
              <Link
                to={'/add-product'}
                className="flex items-center gap-2 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors rounded-xl px-5 py-2.5 shadow-xs"
              >
                <PlusIcon size={18} />
                <span>{t('Add Product')}</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <motion.div
        className="sidebar-page-container flex-1 overflow-y-auto pt-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          {isMobile ? <MobileManagementTable /> : <ManagementTable />}
        </motion.div>
      </motion.div>

      <ImportProductsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      <BulkDiscountModal
        isOpen={isBulkDiscountModalOpen}
        selectedCount={selectedRows.length}
        onClose={closeBulkDiscountModal}
        isPending={bulkDiscountMutation.isPending}
        onSubmit={(data) => {
          bulkDiscountMutation.mutate({
            productIds: selectedRows.map(String),
            ...data,
          });
        }}
      />
    </>
  );
};

export default Management;

