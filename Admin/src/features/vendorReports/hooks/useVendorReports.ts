import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getAdminOrders } from '../../../services/orders';
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils';
import type { DetailedOrder, OrderStatus } from '../types';

async function fetchVendorReportOrdersData(pageNum: number, pageSize: number) {
  const res = await getAdminOrders({ pageNum, pageSize });
  const mapped: DetailedOrder[] = (res.items || []).map((ord) => {
    const shortId = ord.id
      ? ord.id.length > 8
        ? ord.id.slice(-6).toUpperCase()
        : ord.id
      : '--';
    const orderIdStr = ord.id ? `#ORD-${shortId}` : '--';
    const dateStr = ord.createdAt
      ? new Date(ord.createdAt).toISOString().split('T')[0]
      : '--';

    const amt = ord.grandTotalAmount ?? ord.subtotalAmount ?? 0;
    const statusLower = (ord.overallStatus || ord.paymentStatus || 'processing').toLowerCase();
    let parsedStatus: OrderStatus = 'processing';
    if (['delivered', 'completed'].includes(statusLower)) parsedStatus = 'delivered';
    else if (['canceled', 'cancelled'].includes(statusLower)) parsedStatus = 'canceled';
    else if (['shipped'].includes(statusLower)) parsedStatus = 'shipped';

    return {
      id: orderIdStr,
      date: dateStr,
      amount: amt,
      commission: 0,
      net: amt,
      status: parsedStatus,
    };
  });

  return {
    orders: mapped,
    totalOrdersCount: res.pagination?.totalItems ?? mapped.length,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export function useVendorReportOrders(pageNum: number, pageSize: number = 20) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vendor-report-orders', pageNum, pageSize],
    queryFn: () => fetchVendorReportOrdersData(pageNum, pageSize),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Prefetch next page using React Query
  useEffect(() => {
    if (query.data && pageNum < query.data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['vendor-report-orders', pageNum + 1, pageSize],
        queryFn: () => fetchVendorReportOrdersData(pageNum + 1, pageSize),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [query.data, pageNum, pageSize, queryClient]);

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
