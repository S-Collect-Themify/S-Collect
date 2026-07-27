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

const topSellingProducts: ProductSale[] = [
  {
    id: 'prod_001',
    name: 'Wireless Earbuds Pro',
    imageUrl:
      'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 830,
    revenue: 28400,
    currency: 'SAR',
    percentage: 8.6,
  },
  {
    id: 'prod_002',
    name: 'Smart Fitness Watch Series 7',
    imageUrl:
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 542,
    revenue: 18970,
    currency: 'SAR',
    percentage: 12.4,
  },
  {
    id: 'prod_003',
    name: 'Ergonomic Mesh Office Chair',
    imageUrl:
      'https://images.unsplash.com/photo-1505797055758-61de4d72c9d8?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 215,
    revenue: 32250,
    currency: 'SAR',
    percentage: 5.2,
  },
  {
    id: 'prod_004',
    name: '4K Ultra HD Action Camera',
    imageUrl:
      'https://images.unsplash.com/photo-1513137025866-56c8906dda3c?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 410,
    revenue: 16400,
    currency: 'SAR',
    percentage: 9.8,
  },
  {
    id: 'prod_005',
    name: 'Portable Power Bank 20000mAh',
    imageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 1205,
    revenue: 18075,
    currency: 'SAR',
    percentage: 15.3,
  },
  {
    id: 'prod_006',
    name: 'Mechanical Gaming Keyboard',
    imageUrl:
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 678,
    revenue: 27120,
    currency: 'SAR',
    percentage: 11.2,
  },
  {
    id: 'prod_007',
    name: 'Wireless Charging Stand',
    imageUrl:
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 945,
    revenue: 18900,
    currency: 'SAR',
    percentage: 14.1,
  },
  {
    id: 'prod_008',
    name: 'Premium Leather Backpack',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 312,
    revenue: 24960,
    currency: 'SAR',
    percentage: 7.5,
  },
  {
    id: 'prod_009',
    name: 'Smart Home Security Camera',
    imageUrl:
      'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 524,
    revenue: 20960,
    currency: 'SAR',
    percentage: 10.3,
  },
  {
    id: 'prod_010',
    name: 'Noise-Cancelling Headphones',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop&crop=center&auto=format',
    unitsSold: 867,
    revenue: 34680,
    currency: 'SAR',
    percentage: 18.9,
  },
];

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
