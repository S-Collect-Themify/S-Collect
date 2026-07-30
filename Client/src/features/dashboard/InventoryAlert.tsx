import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import InventoryCard from './InventoryCard';
import InventoryAlertSkeleton from './skeleton/InventoryAlertSkeleton';
import { getVendorInventory } from '../../services/inventory';
import { searchVendorProducts } from '../../services/products';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
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

const DEFAULT_IMAGE =
  './placeholder.jpg';

const resolveImageUrl = (rawUrl: any): string => {
  if (!rawUrl) return DEFAULT_IMAGE;
  let urlStr = '';
  if (typeof rawUrl === 'string') {
    urlStr = rawUrl;
  } else if (typeof rawUrl === 'object') {
    urlStr = rawUrl.url || rawUrl.src || rawUrl.path || '';
  }
  if (!urlStr || typeof urlStr !== 'string' || urlStr.trim() === '') {
    return DEFAULT_IMAGE;
  }
  if (
    urlStr.startsWith('http://') ||
    urlStr.startsWith('https://') ||
    urlStr.startsWith('data:')
  ) {
    return urlStr;
  }
  return `https://api.collect-s.com${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
};

const InventoryAlert = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: inventoryData, isLoading: isInvLoading } = useQuery({
    queryKey: ['dashboardInventoryAlerts'],
    queryFn: () => getVendorInventory({ pageNum: 1, pageSize: 20 }),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const { data: productsData } = useQuery({
    queryKey: ['dashboardInventoryProductsMap'],
    queryFn: () => searchVendorProducts({ pageNum: 1, pageSize: 50 }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isInvLoading) {
    return <InventoryAlertSkeleton />;
  }

  const productImgMap: Record<string, string> = {};
  const productsList =
    productsData?.items || (Array.isArray(productsData) ? productsData : []);
  productsList.forEach((prod: any) => {
    let rawImg: any = null;
    if (prod.thumbnailUrl) {
      rawImg = prod.thumbnailUrl;
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      const thumb =
        prod.images.find((img: any) => img.isThumbnail) || prod.images[0];
      rawImg = thumb;
    } else if (prod.imageUrl) {
      rawImg = prod.imageUrl;
    }
    if (prod.id) {
      productImgMap[prod.id] = resolveImageUrl(rawImg);
    }
  });

  const alertItems = (inventoryData?.items || [])
    .map((item) => {
      const name = isAr
        ? item.productNameAr || item.productName || ''
        : item.productName || item.productNameAr || '';
      const label = isAr
        ? item.labelNameAr || item.labelName
        : item.labelName || item.labelNameAr;
      const fullName = label ? `${name} - ${label}` : name;
      const stockCount = item.stock || 0;

      let status: 'Out of Stock' | 'Low Stock' | 'In Stock' = 'In Stock';
      let text: 'var(--red)' | 'var(--yellow)' | 'var(--green)' =
        'var(--green)';
      let background:
        'var(--red-light)' | 'var(--yellow-light)' | 'var(--green-light)' =
        'var(--green-light)';

      if (stockCount === 0) {
        status = 'Out of Stock';
        text = 'var(--red)';
        background = 'var(--red-light)';
      } else if (stockCount <= 5) {
        status = 'Low Stock';
        text = 'var(--yellow)';
        background = 'var(--yellow-light)';
      }

      const image = productImgMap[item.productId] || DEFAULT_IMAGE;

      return {
        id: `${item.productId}-${item.variantId}`,
        name: fullName || 'Product',
        sku: item.sku || 'N/A',
        stockCount,
        status,
        theme: { text, background },
        image,
      };
    })
    .sort((a, b) => {
      const priority = { 'Out of Stock': 0, 'Low Stock': 1, 'In Stock': 2 };
      return priority[a.status] - priority[b.status];
    });

  const lowOrNoStockCount = alertItems.filter(
    (item) => item.status === 'Out of Stock' || item.status === 'Low Stock'
  ).length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full rounded-lg bg-white p-3 lg:p-8 shadow h-[450px] lg:h-[512px]"
    >
      <motion.div
        variants={itemVariants}
        className="flex gap-2 items-center mb-3 lg:mb-6"
      >
        <TriangleAlert className="text-yellow w-4 h-4 lg:w-6 lg:h-6" />
        <h3 className="text-sm lg:text-xl font-bold">{t('inventoryAlerts')}</h3>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-yellow-light text-yellow px-4 py-2.5 rounded-lg text-sm mb-6 hidden lg:block"
      >
        <p>
          {lowOrNoStockCount > 0
            ? `${lowOrNoStockCount} ${t('inventoryItem.alertMessage', 'products are running low on stock.')}`
            : t(
              'inventoryItem.allStockGood',
              'All inventory stock levels look good.'
            )}
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="mb-6 flex flex-col gap-3 h-[60%] overflow-y-auto pr-1"
      >
        {isInvLoading ? (
          <div className="text-center py-8 text-gray-400 animate-pulse text-sm">
            Loading inventory alerts...
          </div>
        ) : alertItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No inventory items found.
          </div>
        ) : (
          alertItems.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <InventoryCard cardData={item} />
            </motion.div>
          ))
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link
          to={'/inventory'}
          className="w-full text-center rounded-lg border block py-1.5 lg:py-3 mt-auto hover:bg-gray-50 transition-colors"
        >
          {t('inventoryItem.manageInventory')}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default InventoryAlert;
