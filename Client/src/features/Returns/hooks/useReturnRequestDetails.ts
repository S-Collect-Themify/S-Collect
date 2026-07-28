import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getVendorSubOrderDetails,
  updateVendorSubOrderStatus,
} from '../../../services/returns';
import {
  getRefundDetail,
  approveRefund,
  rejectRefund,
} from '../../../services/refunds';
import type { ReturnItem } from '../types';

export function useReturnRequestDetails(rawId: string, decodedId: string) {
  const queryClient = useQueryClient();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [internalNote, setInternalNote] = useState('');

  // Smooth scroll to top when opening details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [decodedId]);

  // Fetch refund detail first, or fallback to sub-order details
  const {
    data: refundDetail,
    isLoading: isRefundLoading,
    isError: isRefundError,
  } = useQuery({
    queryKey: ['vendor-refund-detail', rawId],
    queryFn: () => getRefundDetail(rawId),
    enabled: Boolean(rawId),
    staleTime: 10_000,
    retry: false,
  });

  const { data: subDetail, isLoading: isSubLoading } = useQuery({
    queryKey: ['returnRequestDetails', rawId],
    queryFn: () => getVendorSubOrderDetails(rawId),
    enabled: Boolean(rawId) && isRefundError,
    staleTime: 10_000,
    retry: false,
  });

  const isLoading = isRefundError ? isSubLoading : isRefundLoading;

  // Mutator for approving or rejecting return/refund status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      status,
      reason,
    }: {
      status: 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED';
      reason?: string;
    }) => {
      if (status === 'APPROVED' || status === 'DELIVERED') {
        try {
          return await approveRefund(rawId, { note: internalNote });
        } catch {
          return await updateVendorSubOrderStatus(rawId, {
            status: 'DELIVERED',
          });
        }
      } else {
        try {
          return await rejectRefund(rawId, { reason });
        } catch {
          return await updateVendorSubOrderStatus(rawId, {
            status: 'CANCELLED',
            trackingNumber: reason,
          });
        }
      }
    },
    onSuccess: (res) => {
      if (res) {
        queryClient.setQueryData(['vendor-refund-detail', rawId], res);
      }
      queryClient.invalidateQueries({
        queryKey: ['vendor-refund-detail', rawId],
      });
      queryClient.invalidateQueries({
        queryKey: ['returnRequestDetails', rawId],
      });
      queryClient.invalidateQueries({ queryKey: ['vendor-refunds'] });
      queryClient.invalidateQueries({ queryKey: ['return-requests'] });
    },
  });

  // Map refundDetail or subDetail to ReturnItem
  const item = useMemo<ReturnItem | null>(() => {
    const statusMap: Record<string, ReturnItem['status']> = {
      PENDING: 'PENDING_REVIEW',
      PENDING_REVIEW: 'PENDING_REVIEW',
      APPROVED: 'APPROVED',
      ACCEPT: 'APPROVED',
      ACCEPTED: 'APPROVED',
      REJECTED: 'REJECTED',
      DECLINED: 'REJECTED',
      PROCESSED: 'COMPLETED',
      COMPLETED: 'COMPLETED',
      DELIVERED: 'COMPLETED',
    };

    if (refundDetail) {
      const firstItem = refundDetail.items?.[0] || ({} as any);
      const custName =
        [refundDetail.customer?.firstName, refundDetail.customer?.lastName]
          .filter(Boolean)
          .join(' ') || 'Customer';

      const address =
        [
          refundDetail.shipping?.shippingStreetAddress,
          refundDetail.shipping?.shippingCity,
        ]
          .filter(Boolean)
          .join(', ') || '';

      const rawStatusUpper = (refundDetail.status || '').toUpperCase();
      const currentStatus = statusMap[rawStatusUpper] || 'PENDING_REVIEW';

      const reqDateFormatted = new Date(refundDetail.createdAt).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      );

      const isApproved = currentStatus === 'APPROVED' || currentStatus === 'COMPLETED';
      const isRejected = currentStatus === 'REJECTED';
      const isCompleted = currentStatus === 'COMPLETED';

      const timeline = [
        {
          title: 'Return Request Submitted',
          date: reqDateFormatted,
          subtext: 'Customer submitted a return request',
          completed: true,
          active: false,
        },
        {
          title: isRejected
            ? 'Return Request Rejected'
            : isApproved
              ? 'Return Request Approved'
              : 'Pending Vendor Review',
          date: isApproved || isRejected ? 'Recorded' : '',
          subtext: isRejected
            ? refundDetail.rejectionReason || 'Request rejected by vendor'
            : isApproved
              ? 'Vendor approved the request'
              : 'Waiting for vendor review',
          completed: isApproved || isRejected,
          active: currentStatus === 'PENDING_REVIEW',
        },
        {
          title: 'Refund Processing',
          date: isCompleted ? 'Completed' : '',
          subtext: isCompleted
            ? 'Refund issued to customer'
            : isRejected
              ? 'No refund processed'
              : 'Pending admin refund processing',
          completed: isCompleted,
          active: isApproved && !isCompleted,
        },
      ];

      return {
        id: `#RET-${refundDetail.id.slice(0, 8).toUpperCase()}`,
        orderId: `#ORD-${refundDetail.orderId.slice(0, 8).toUpperCase()}`,
        customerName: custName,
        customerEmail: refundDetail.customer?.email || 'customer@example.com',
        customerPhone: refundDetail.customer?.phoneNumber || '',
        shippingAddress: address,
        productTitle: firstItem.productNameSnapshot || 'Returned Product',
        productSku: firstItem.orderItemId || 'SKU-001',
        productVariant: firstItem.variantLabelSnapshot || 'Default',
        productQty: 1,
        productPrice: `SAR ${(firstItem.refundAmount || refundDetail.totalRefundAmount || 0).toFixed(2)}`,
        productImage:
          firstItem.thumbnailUrl || refundDetail.imageUrls?.[0] || '',
        reason:
          firstItem.reason ||
          'DAMAGED_DEFECTIVE',
        rejectionReason: refundDetail.rejectionReason || undefined,
        requestedDate: reqDateFormatted,
        status: currentStatus,
        rawId: refundDetail.id,
        rawStatus: refundDetail.status,
        uploadedImages: refundDetail.imageUrls || [],
        timeline,
      };
    }

    if (subDetail) {
      const firstProduct = (subDetail.items[0] || {}) as any;
      const orderObj = (subDetail as any).order;
      const buyerObj = orderObj?.buyer || (subDetail as any).buyer;
      const customerName =
        buyerObj?.name ||
        buyerObj?.nameAr ||
        orderObj?.customerName ||
        (subDetail as any).customerName ||
        'Customer';

      const rawStatusUpper = (subDetail.status || '').toUpperCase();
      const currentStatus =
        rawStatusUpper === 'DELIVERED'
          ? 'COMPLETED'
          : rawStatusUpper === 'CANCELLED'
            ? 'REJECTED'
            : statusMap[rawStatusUpper] || 'PENDING_REVIEW';

      const reqDateFormatted = new Date(subDetail.createdAt).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }
      );

      return {
        id: `#RET-${subDetail.id.slice(0, 8).toUpperCase()}`,
        orderId: `#ORD-${subDetail.orderId.slice(0, 8).toUpperCase()}`,
        customerName,
        customerEmail:
          buyerObj?.email || orderObj?.customerEmail || 'customer@example.com',
        customerPhone: buyerObj?.phone || orderObj?.customerPhone || '',
        shippingAddress: orderObj?.shippingAddress || '',
        productTitle: firstProduct.productName || 'Order Product',
        productSku:
          firstProduct.sku ||
          (firstProduct.productId && typeof firstProduct.productId === 'object'
            ? (firstProduct.productId as any).sku
            : null) ||
          'SKU-001',
        productVariant: firstProduct.variantLabel || 'Default',
        productQty: firstProduct.quantity || 1,
        productPrice: `SAR ${(firstProduct.unitPrice || firstProduct.lineTotal || 0).toFixed(2)}`,
        productImage: firstProduct.productImage || firstProduct.imageUrl || '',
        reason: subDetail.statusOverrideReason || "Item doesn't fit",
        requestedDate: reqDateFormatted,
        status: currentStatus,
        rawId: subDetail.id,
        rawStatus: subDetail.status,
      };
    }

    return null;
  }, [refundDetail, subDetail]);

  const handleApprove = async () => {
    setShowApproveModal(false);
    try {
      await updateStatusMutation.mutateAsync({ status: 'APPROVED' });
      toast.success('Return Request Approved successfully');
    } catch {
      toast.error('Failed to approve return request');
    }
  };

  const handleReject = async (reason: string) => {
    setShowRejectModal(false);
    try {
      await updateStatusMutation.mutateAsync({ status: 'REJECTED', reason });
      toast.success(`Return Request Rejected: ${reason || 'Decision recorded'}`);
    } catch {
      toast.error('Failed to reject return request');
    }
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
