import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVendorSubOrders, updateVendorSubOrderStatus } from '../../../services/returns';
import type { ReturnItem } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../types/api';

export function useReturnRequests() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search parameters from URL (Single source of truth)
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'ALL';
  const dateFilter = searchParams.get('date') || '30';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Fetch all return requests (sub-orders) from backend
  const { data: rawData, error } = useQuery({
    queryKey: ['return-requests'],
    queryFn: () => getVendorSubOrders({ limit: 100 }),
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Map API response to ReturnItem format
  const allItems: ReturnItem[] = useMemo(() => {
    if (!rawData?.items) return [];

    return rawData.items.map((sub, idx) => {
      const firstProduct = (sub.items[0] || {}) as any;
      const dateObj = new Date(sub.createdAt);
      const formattedDate = isNaN(dateObj.getTime())
        ? 'Jun 17, 2027'
        : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const statusMap: Record<string, ReturnItem['status']> = {
        PENDING: 'PENDING_REVIEW',
        PROCESSING: 'PENDING_REVIEW',
        SHIPPED: 'AWAITING_ITEM',
        DELIVERED: 'COMPLETED',
        CANCELLED: 'REJECTED',
      };

      // Resolve product image URL defensively
      let productImage = '';
      if (firstProduct.productImage) {
        productImage = firstProduct.productImage;
      } else if (firstProduct.imageUrl) {
        productImage = firstProduct.imageUrl;
      } else if (firstProduct.productId && typeof firstProduct.productId === 'object') {
        const prod = firstProduct.productId as any;
        if (prod.thumbnailUrl) {
          productImage = typeof prod.thumbnailUrl === 'string' ? prod.thumbnailUrl : (prod.thumbnailUrl.url || '');
        } else if (Array.isArray(prod.images) && prod.images.length > 0) {
          const firstImg = prod.images[0];
          productImage = typeof firstImg === 'string' ? firstImg : (firstImg.url || '');
        }
      }

      // Resolve SKU defensively
      const productSku = firstProduct.sku || 
        (firstProduct.productId && typeof firstProduct.productId === 'object' ? (firstProduct.productId as any).sku : null) || 
        (typeof firstProduct.productId === 'string' ? firstProduct.productId : null) || 
        'SKU-001';

      // Resolve customer details defensively
      const orderObj = (sub as any).order;
      const buyerObj = orderObj?.buyer || (sub as any).buyer;
      const customerName = buyerObj?.name || buyerObj?.nameAr || orderObj?.customerName || (sub as any).customerName || `Customer #${idx + 1}`;
      const customerEmail = buyerObj?.email || orderObj?.customerEmail || (sub as any).customerEmail || 'customer@example.com';
      const customerPhone = buyerObj?.phone || orderObj?.customerPhone || (sub as any).customerPhone || '';
      const shippingAddress = orderObj?.shippingAddress || (sub as any).shippingAddress || '';

      return {
        id: `#RET-${sub.id.slice(0, 8).toUpperCase()}`,
        orderId: `#ORD-${sub.orderId.slice(0, 8).toUpperCase()}`,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        productTitle: firstProduct.productName || 'Order Product',
        productSku,
        productVariant: firstProduct.variantLabel || 'Default',
        productQty: firstProduct.quantity || 1,
        productPrice: `SAR ${(firstProduct.unitPrice || firstProduct.lineTotal || 0).toFixed(2)}`,
        productImage,
        reason: sub.statusOverrideReason || "Item doesn't fit",
        requestedDate: formattedDate,
        status: statusMap[sub.status] || 'PENDING_REVIEW',
        createdAt: sub.createdAt,
        rawId: sub.id,
      };
    });
  }, [rawData]);

  // Filter items locally based on search, status, and date filters
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.customerName.toLowerCase().includes(search.toLowerCase()) ||
        item.productTitle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;

      let matchDate = true;
      if (dateFilter !== 'ALL') {
        const days = parseInt(dateFilter, 10);
        if (!isNaN(days)) {
          const itemDate = new Date(item.createdAt || '');
          const limitDate = new Date();
          limitDate.setDate(limitDate.getDate() - days);
          matchDate = itemDate >= limitDate;
        }
      }

      return matchSearch && matchStatus && matchDate;
    });
  }, [allItems, search, statusFilter, dateFilter]);

  // Pagination calculations
  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredItems.length);
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  // Parameter Change Handlers
  const handleSearchChange = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set('search', val);
      else prev.delete('search');
      prev.set('page', '1');
      return prev;
    });
  };

  const handleStatusFilterChange = (val: string) => {
    setSearchParams((prev) => {
      if (val !== 'ALL') prev.set('status', val);
      else prev.delete('status');
      prev.set('page', '1');
      return prev;
    });
  };

  const handleDateFilterChange = (val: string) => {
    setSearchParams((prev) => {
      if (val) prev.set('date', val);
      else prev.delete('date');
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      prev.set('page', String(page));
      return prev;
    });
  };

  // Mutation for updating return status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const rawId = id.replace('#RET-', '').toLowerCase();
      return updateVendorSubOrderStatus(rawId, { status, trackingNumber: reason });
    },
    onSuccess: () => {
      toast.success(t('returnsPage.updateSuccess', { defaultValue: 'Status updated successfully!' }));
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
    onError: (err: unknown) => {
      const msg = getErrorMessage(err, 'Failed to update return status.');
      toast.error(msg);
    },
  });

  return {
    search,
    statusFilter,
    dateFilter,
    activePage,
    currentItems,
    filteredItems,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    error,
    handleSearchChange,
    handleStatusFilterChange,
    handleDateFilterChange,
    handlePageChange,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}
