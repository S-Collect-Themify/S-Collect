import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import TopSellingCard from './TopSellingCard';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

type ProductSale = {
  id: string;
  name: string;
  imageUrl: string;
  unitsSold: number;
  revenue: number;
  currency: string;
  percentage: number;
};

const topSellingProducts: ProductSale[] = [];

const TopSelling = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 overflow-hidden bg-white p-4 rounded-lg shadow h-[550px]"
    >
      {/* Header appears with container */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between gap-2 shrink-0"
      >
        <h2 className="text-xl font-bold">{t('topSelling.title')}</h2>
        <button className="text-sm text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
          {t('topSelling.viewAll')}
        </button>
      </motion.div>

      {/* Scrollable product list with staggered children */}
      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-2 overflow-y-auto h-full pr-1"
      >
        {topSellingProducts.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <TopSellingCard cardData={product} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default TopSelling;
