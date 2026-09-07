import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVendorNotifications,
  markAllVendorNotificationsRead,
  markVendorNotificationRead,
} from '../../../services/notifications';
import type {
  GetNotificationsParams,
  PaginatedVendorNotifications,
} from '../types';

export const NOTIFICATIONS_QUERY_KEY = ['vendor-notifications'];

export const useVendorNotifications = (params?: GetNotificationsParams) => {
  const pageNum = params?.pageNum ?? 1;
  const pageSize = params?.pageSize ?? 25;

  return useQuery<PaginatedVendorNotifications>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, pageNum, pageSize],
    queryFn: () => getVendorNotifications({ pageNum, pageSize }),
    refetchInterval: 30000, // 30-second polling for fresh alerts
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markVendorNotificationRead(id),
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      // Snapshot previous cache values
      const previousData = queryClient.getQueriesData<PaginatedVendorNotifications>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      // Optimistically update matching notification to isRead: true
      queryClient.setQueriesData<PaginatedVendorNotifications>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) =>
              item.id === id ? { ...item, isRead: true } : item
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // Invalidate to synchronize with server
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllVendorNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });

      const previousData = queryClient.getQueriesData<PaginatedVendorNotifications>({
        queryKey: NOTIFICATIONS_QUERY_KEY,
      });

      // Optimistically mark all items as isRead: true
      queryClient.setQueriesData<PaginatedVendorNotifications>(
        { queryKey: NOTIFICATIONS_QUERY_KEY },
        (old) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((item) => ({ ...item, isRead: true })),
          };
        }
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });
};
