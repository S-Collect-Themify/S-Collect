import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminSubOrders } from '../../../services/orders';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import type { DetailedOrder, OrderStatus } from '../types';

async function fetchVendorReportOrdersData(vendorId: string | undefined, pageNum: number, pageSize: number) {
  if (!vendorId) {
    return { orders: [], totalOrdersCount: 0, totalPages: 1 };
  }

  const res = await getAdminSubOrders({ vendorId, pageNum, pageSize });
  const mapped: DetailedOrder[] = (res.items || []).map((ord: any) => {
    const idStr = ord.id ? String(ord.id) : ord.orderId ? String(ord.orderId) : '';
    const shortId = idStr ? (idStr.length > 8 ? idStr.slice(-6).toUpperCase() : idStr) : '--';
    const orderIdStr = shortId !== '--' ? `#ORD-${shortId}` : '--';
    const dateStr = ord.createdAt || ord.shippedAt
      ? new Date(ord.createdAt || ord.shippedAt).toISOString().split('T')[0]
      : '--';

    const amt = typeof ord.totalAmount === 'number'
      ? ord.totalAmount
      : typeof ord.subtotalAmount === 'number'
      ? ord.subtotalAmount
      : parseFloat(ord.totalAmount) || 0;

    const commissionRate = typeof ord.commissionRateApplied === 'number' ? ord.commissionRateApplied : 10;
    const commissionAmt = (amt * commissionRate) / 100;
    const netAmt = Math.max(0, amt - commissionAmt);

    const statusLower = (ord.status || 'processing').toLowerCase();
    let parsedStatus: OrderStatus = 'processing';
    if (['delivered', 'completed'].includes(statusLower)) parsedStatus = 'delivered';
    else if (['canceled', 'cancelled', 'rejected'].includes(statusLower)) parsedStatus = 'canceled';
    else if (['shipped'].includes(statusLower)) parsedStatus = 'shipped';

    return {
      id: orderIdStr,
      date: dateStr,
      amount: amt,
      commission: Math.round(commissionAmt * 100) / 100,
      net: Math.round(netAmt * 100) / 100,
      status: parsedStatus,
    };
  });

  return {
    orders: mapped,
    totalOrdersCount: res.pagination?.totalItems ?? mapped.length,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export function useVendorReportOrders(vendorId?: string, pageNum: number = 1, pageSize: number = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vendor-report-orders', vendorId, pageNum, pageSize],
    queryFn: () => fetchVendorReportOrdersData(vendorId, pageNum, pageSize),
    enabled: !!vendorId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Prefetch next page using React Query
  useEffect(() => {
    if (vendorId && query.data && pageNum < query.data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['vendor-report-orders', vendorId, pageNum + 1, pageSize],
        queryFn: () => fetchVendorReportOrdersData(vendorId, pageNum + 1, pageSize),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [vendorId, query.data, pageNum, pageSize, queryClient]);

  return {
    orders: query.data?.orders ?? [],
    totalOrdersCount: query.data?.totalOrdersCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export interface ExportReportPayload {
  format: 'excel' | 'pdf';
  fileName: string;
  title: string;
  headers: Array<{ key: keyof DetailedOrder; label: string }>;
  data: DetailedOrder[];
}

export function useExportVendorReportMutation() {
  return useMutation({
    mutationFn: async (payload: ExportReportPayload) => {
      if (payload.format === 'excel') {
        exportToCSV(payload.fileName, payload.headers, payload.data);
      } else {
        exportToPDF(payload.title, payload.headers, payload.data);
      }
    },
    onSuccess: (_, variables) => {
      if (variables.format === 'excel') {
        toast.success('Vendor Sales Report exported to Excel successfully!');
      } else {
        toast.success('Vendor Sales Report exported to PDF successfully!');
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to export report');
    },
  });
}
