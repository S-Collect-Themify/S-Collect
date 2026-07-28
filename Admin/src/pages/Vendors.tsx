import { useTranslation } from 'react-i18next';
import VendorTable from '../features/vendors/components/VendorTable';
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

  return (
    <>
      <div className="sidebar-page-container-header border-b border-gray-100/80">
        <h1 className="font-bold text-gray-900 heading-page-title ">{t('vendors.title')}</h1>
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
