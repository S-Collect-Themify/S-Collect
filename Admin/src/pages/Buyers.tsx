import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { BuyerTable } from '../features/buyers';
import { useBuyerStore } from '../features/buyers/store/buyerStore';

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

const Buyers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    useBuyerStore.getState().setPage(1);
  }, []);

  return (
    <>
      {/* Header Container (Matching Orders, Categories & Transactions) */}
      <div className="sidebar-page-container-header bg-white border-b border-gray-200/80 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title">
              {t('buyers.title', 'Buyers')}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/buyers/new')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            {t('buyers.add.button', 'Add Buyer')}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants}>
            <BuyerTable />
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Buyers;
