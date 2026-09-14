import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '../services/notifications.service';
import type { GetNotificationsResponse } from '../types/notification.types';

export function useNotifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<GetNotificationsResponse>({
    queryKey: ['admin-notifications'],
    queryFn: notificationsService.getNotifications,
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new notifications
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['admin-notifications'] });
      const previousData = queryClient.getQueryData<GetNotificationsResponse>(['admin-notifications']);

      if (previousData) {
        const updatedNotifications = previousData.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        );
        queryClient.setQueryData<GetNotificationsResponse>(['admin-notifications'], {
          notifications: updatedNotifications,
          unreadCount: Math.max(0, updatedNotifications.filter((n) => !n.isRead).length),
        });
      }

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['admin-notifications'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['admin-notifications'] });
      const previousData = queryClient.getQueryData<GetNotificationsResponse>(['admin-notifications']);

      if (previousData) {
        queryClient.setQueryData<GetNotificationsResponse>(['admin-notifications'], {
          notifications: previousData.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['admin-notifications'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const notifications = notificationsQuery.data?.notifications || [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
}
