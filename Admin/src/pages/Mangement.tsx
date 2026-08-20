import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ManagementTable from '../features/mangement/ManagementTable';
import MobileManagementTable from '../features/mangement/mobile/MobileManagementTable';
import { useManagementStore } from '../features/mangement/managementStore';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
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

const Management = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    useManagementStore.getState().setPage(1);
  }, []);

  return (
    <>
      <div className="sidebar-page-container flex items-center justify-between mb-5 md:mb-10 mb-5 bg-gray-50">
        <h1 className="md:text-h4 text-h6 py-2 md:py-5">{t('managementTable.title')}</h1>
        {isMobile ? (
          <Link
            to={'/add-product'}
            className="flex items-center gap-2 text-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors rounded-full p-2"
          >
            <PlusIcon size={22} />
          </Link>
        ) : (
          <Link
            to={'/add-product'}
            className="flex items-center gap-2 text-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors rounded-lg px-6 py-2"
          >
            <PlusIcon size={22} />

            {t('Add Product')}
          </Link>
        )}
      </div>
      <motion.div
        className="sidebar-page-container py-6 md:py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          {isMobile ? <MobileManagementTable /> : <ManagementTable />}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Management;
