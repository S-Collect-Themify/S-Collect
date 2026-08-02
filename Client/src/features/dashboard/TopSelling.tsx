import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import TopSellingCard from './TopSellingCard';
import TopSellingSkeleton from './skeleton/TopSellingSkeleton';
import { searchVendorProducts } from '../../services/products';
import { getSubOrders } from '../../services/orders';

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

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=150&h=150&fit=crop&crop=center&auto=format';

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

const TopSelling = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language === 'ar';

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['dashboardTopSellingProducts'],
    queryFn: () => searchVendorProducts({ pageNum: 1, pageSize: 20 }),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const { data: subOrdersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['dashboardTopSellingSubOrders'],
    queryFn: () => getSubOrders({ pageNum: 1, pageSize: 100 }),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = isLoadingProducts || isLoadingOrders;

  if (isLoading) {
    return <TopSellingSkeleton />;
  }

  const productsList =
    productsData?.items || (Array.isArray(productsData) ? productsData : []);

  // Map product sales from sub-orders if available
  const productSalesMap = new Map<string, { count: number; revenue: number }>();
  const subOrdersList = subOrdersData?.items || [];
  if (Array.isArray(subOrdersList)) {
    for (const order of subOrdersList) {
      if (order.status !== 'CANCELLED' && Array.isArray(order.items)) {
        for (const item of order.items) {
          const pId = item.productId;
          if (pId) {
            const existing = productSalesMap.get(pId) || { count: 0, revenue: 0 };
            const qty = item.quantity || 1;
            const lineRev = item.lineTotal || (item.unitPrice ? item.unitPrice * qty : 0);
            productSalesMap.set(pId, {
              count: existing.count + qty,
              revenue: existing.revenue + lineRev,
            });
          }
        }
      }
    }
  }

  const rawProducts = productsList.map((prod: any, idx: number) => {
    const name = isAr
      ? prod.nameAr || prod.name || ''
      : prod.name || prod.nameAr || '';

    let price = 0;
    if (typeof prod.minPrice === 'number') {
      price = prod.minPrice;
    } else if (prod.minPrice && typeof prod.minPrice === 'object') {
      price = Number(
        (prod.minPrice as any).amount || (prod.minPrice as any).value || 0
      );
    } else if (typeof prod.compareAtPrice === 'number') {
      price = prod.compareAtPrice;
    } else if (typeof prod.basePrice === 'number') {
      price = prod.basePrice;
    } else if (typeof prod.price === 'number') {
      price = prod.price;
    }

    const salesData = productSalesMap.get(prod.id);
    const salesCount = Number(
      prod.salesCount ?? prod.soldCount ?? prod.unitsSold ?? salesData?.count ?? 0
    );
    const revenueFromOrders = salesData?.revenue ?? (salesCount > 0 ? salesCount * price : 0);

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

    const imageUrl = resolveImageUrl(rawImg);

    return {
      id: prod.id || `prod_${idx}`,
      name: name || 'Vendor Product',
      imageUrl,
      unitsSold: salesCount,
      revenue: revenueFromOrders,
      price,
    };
  });

  // Sort products by unitsSold descending, then by revenue descending
  rawProducts.sort((a: any, b: any) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);

  const totalSales = rawProducts.reduce(
    (sum: number, item: any) => sum + item.unitsSold,
    0
  );
  const maxSales = Math.max(
    ...rawProducts.map((item: any) => item.unitsSold),
    0
  );

  const topProducts = rawProducts.slice(0, 10).map((item: any) => {
    const percentage =
      totalSales > 0
        ? Number(((item.unitsSold / totalSales) * 100).toFixed(1))
        : maxSales > 0
          ? Number(((item.unitsSold / maxSales) * 100).toFixed(1))
          : 0;

    return {
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      unitsSold: item.unitsSold,
      revenue: item.revenue,
      currency: t('dashboardMetrics.unit.sar') || 'SAR',
      percentage,
    };
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 overflow-hidden bg-white p-4 rounded-xl shadow h-[550px]"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between gap-2 shrink-0"
      >
        <h2 className="text-xl font-bold">{t('topSelling.title')}</h2>
        <button
          onClick={() => navigate('/management')}
          className="text-sm text-primary flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {t('topSelling.viewAll')}
        </button>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="flex flex-col gap-2 overflow-y-auto h-full pr-1"
      >
        {isLoading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse text-sm">
            Loading products...
          </div>
        ) : topProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No products found for this vendor.
          </div>
        ) : (
          topProducts.map((product: any) => (
            <motion.div key={product.id} variants={itemVariants}>
              <TopSellingCard cardData={product} />
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default TopSelling;
