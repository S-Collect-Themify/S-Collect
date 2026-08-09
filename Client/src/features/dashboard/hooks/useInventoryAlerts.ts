import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getVendorInventory } from '../../../services/inventory';
import { searchVendorProducts } from '../../../services/products';
import { DEFAULT_IMAGE, resolveImageUrl } from '../../../utils/image';
import type { InventoryAlertItem, InventoryAlertStatus } from '../types';

interface ProductImageItem {
  isThumbnail?: boolean;
  url?: string;
  [key: string]: unknown;
}

interface ProductItem {
  id?: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  images?: ProductImageItem[];
  [key: string]: unknown;
}

export const useInventoryAlerts = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: inventoryData, isLoading: isInvLoading } = useQuery({
    queryKey: ['dashboardInventoryAlerts'],
    queryFn: () =>
      getVendorInventory({ pageNum: 1, pageSize: 100, maxStock: 5 }),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
  });

  const { data: productsData, isLoading: isProdLoading } = useQuery({
    queryKey: ['dashboardInventoryProductsMap'],
    queryFn: () => searchVendorProducts({ pageNum: 1, pageSize: 100 }),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = isInvLoading || isProdLoading;

  const productImgMap: Record<string, string> = {};
  const productsList: ProductItem[] = Array.isArray(productsData)
    ? productsData
    : (productsData && 'items' in productsData && Array.isArray(productsData.items))
      ? productsData.items
      : [];

  productsList.forEach((prod) => {
    let rawImg: unknown = null;
    if (prod.thumbnailUrl) {
      rawImg = prod.thumbnailUrl;
    } else if (Array.isArray(prod.images) && prod.images.length > 0) {
      const thumb =
        prod.images.find((img) => img.isThumbnail) || prod.images[0];
      rawImg = thumb;
    } else if (prod.imageUrl) {
      rawImg = prod.imageUrl;
    }
    if (prod.id) {
      productImgMap[prod.id] = resolveImageUrl(rawImg);
    }
  });

  const inventoryItems = Array.isArray(inventoryData)
    ? inventoryData
    : (inventoryData && 'items' in inventoryData && Array.isArray(inventoryData.items))
      ? inventoryData.items
      : [];

  const alertItems: InventoryAlertItem[] = inventoryItems
    .filter((item) => typeof item.stock === 'number' && item.stock <= 5)
    .map((item) => {
      const name = isAr
        ? item.productNameAr || item.productName || ''
        : item.productName || item.productNameAr || '';
      const label = isAr
        ? item.labelNameAr || item.labelName
        : item.labelName || item.labelNameAr;
      const fullName = label ? `${name} - ${label}` : name;
      const stockCount = item.stock;

      let status: InventoryAlertStatus = 'In Stock';
      let text: 'var(--red)' | 'var(--yellow)' | 'var(--green)' =
        'var(--green)';
      let background:
        | 'var(--red-light)'
        | 'var(--yellow-light)'
        | 'var(--green-light)' = 'var(--green-light)';

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
        productId: item.productId,
        name: fullName || 'Product',
        sku: item.sku || 'N/A',
        stockCount,
        status,
        theme: { text, background },
        image,
      };
    })
    .sort((a, b) => {
      const priority: Record<InventoryAlertStatus, number> = {
        'Out of Stock': 0,
        'Low Stock': 1,
        'In Stock': 2,
      };
      if (priority[a.status] !== priority[b.status]) {
        return priority[a.status] - priority[b.status];
      }
      return a.stockCount - b.stockCount;
    });

  const lowOrNoStockCount =
    inventoryData?.pagination?.totalItems ?? alertItems.length;

  return {
    alertItems,
    lowOrNoStockCount,
    isLoading,
  };
};
