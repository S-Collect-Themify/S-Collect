import { useTranslation } from 'react-i18next';
import ManagementTable from '../features/mangement/ManagementTable';
import MobileManagementTable from '../features/mangement/mobile/MobileManagementTable';
import { Link } from 'react-router-dom';
import { PlusIcon } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { motion } from 'motion/react';

import { containerVariants, itemVariants } from '../utils/animations';

const Management = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  return (
    <>
      <div className="sidebar-page-container flex items-center justify-between md:mb-10 mb-5 bg-gray-50">
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
        className="sidebar-page-container flex-1 overflow-y-auto pt-0"
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
