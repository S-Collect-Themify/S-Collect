import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getVendorSubOrderDetails, updateVendorSubOrderStatus } from '../../../services/returns';
import type { ReturnItem } from '../types';

export function useReturnRequestDetails(rawId: string, decodedId: string) {
  const queryClient = useQueryClient();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawId);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  // Smooth scroll to top when opening details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [decodedId]);

  // Fetch using react-query
  const { data: sub, isLoading } = useQuery({
    queryKey: ['returnRequestDetails', rawId],
    queryFn: () => getVendorSubOrderDetails(rawId),
    enabled: isUuid,
    staleTime: 10_000,
  });

  // Mutator for updating status
  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => updateVendorSubOrderStatus(rawId, { status }),
    onMutate: async ({ status }) => {
      await queryClient.cancelQueries({ queryKey: ['returnRequestDetails', rawId] });
      const previousSub = queryClient.getQueryData(['returnRequestDetails', rawId]);
      if (previousSub) {
        queryClient.setQueryData(['returnRequestDetails', rawId], {
          ...(previousSub as any),
          status,
        });
      }
      return { previousSub };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousSub) {
        queryClient.setQueryData(['returnRequestDetails', rawId], context.previousSub);
      }
      toast.error('Failed to sync status with server');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returnRequestDetails', rawId] });
      queryClient.invalidateQueries({ queryKey: ['returnRequests'] });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
  });

  // Map sub-order data to ReturnItem structure
  const item = useMemo<ReturnItem | null>(() => {
    if (!sub) return null;
    const firstProduct = (sub.items[0] || {}) as any;

    // Resolve product image URL defensively
    let productImage = '';
    if (firstProduct.productImage) {
      productImage = firstProduct.productImage;
    } else if ((firstProduct as any).imageUrl) {
      productImage = (firstProduct as any).imageUrl;
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
    const productSku = (firstProduct as any).sku || 
      (firstProduct.productId && typeof firstProduct.productId === 'object' ? (firstProduct.productId as any).sku : null) || 
      (typeof firstProduct.productId === 'string' ? firstProduct.productId : null) || 
      'SKU-001';

    // Resolve customer details defensively
    const orderObj = (sub as any).order;
    const buyerObj = orderObj?.buyer || (sub as any).buyer;
    const customerName = buyerObj?.name || buyerObj?.nameAr || orderObj?.customerName || (sub as any).customerName || 'Customer';
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
      requestedDate: new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: sub.status === 'DELIVERED' ? 'COMPLETED' : sub.status === 'CANCELLED' ? 'REJECTED' : 'PENDING_REVIEW',
      rawId: sub.id,
    };
  }, [sub]);

  const handleApprove = async () => {
    setShowApproveModal(false);
    toast.success('Return Request Approved successfully');
    updateStatusMutation.mutate({ status: 'DELIVERED' });
  };

  const handleReject = async (reason: string) => {
    setShowRejectModal(false);
    toast.success(`Return Request Rejected: ${reason || 'Decision recorded'}`);
    updateStatusMutation.mutate({ status: 'CANCELLED' });
  };

  return {
    item,
    isLoading,
    internalNote,
    setInternalNote,
    showApproveModal,
    setShowApproveModal,
    showRejectModal,
    setShowRejectModal,
    handleApprove,
    handleReject,
    isUpdating: updateStatusMutation.isPending,
  };
}
