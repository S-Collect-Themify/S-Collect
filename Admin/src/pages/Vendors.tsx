import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import VendorTable from '../features/vendors/components/VendorTable';
import { useVendorStore } from '../features/vendors/store/vendorStore';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const Vendors = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    useVendorStore.getState().setPage(1);
  }, []);

  return (
    <>
      <div className="sidebar-page-container-header border-b border-gray-100/80 flex items-center justify-between gap-4">
        <h1 className="font-bold text-gray-900 heading-page-title ">{t('vendors.title')}</h1>
        <button
          type="button"
          onClick={() => navigate('/vendors/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} />
          {t('vendors.add.button', 'Add Vendor')}
        </button>
      </div>
      <motion.div
        className="sidebar-page-container py-6 md:py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <VendorTable />
        </motion.div>
      </motion.div>
    </>
  );
};

export default Vendors;
