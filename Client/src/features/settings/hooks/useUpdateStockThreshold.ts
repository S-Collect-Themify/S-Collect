import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  updateAccountSettings,
  type AccountSettings,
} from '../../../services/account';
import { ACCOUNT_SETTINGS_QUERY_KEY } from './useAccountSettings';
import { useInventorySettingsStore } from '../../../store/inventorySettingsStore';
import { getErrorMessage } from '../../../types/api';
import i18n from '../../../i18n';

export const useUpdateStockThreshold = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threshold: number) =>
      updateAccountSettings({ lowStockThreshold: threshold }),
    onSuccess: (updatedData) => {
      if (updatedData.lowStockThreshold !== undefined) {
        useInventorySettingsStore
          .getState()
          .setLowStockThreshold(updatedData.lowStockThreshold);
      }
      queryClient.setQueryData(
        ACCOUNT_SETTINGS_QUERY_KEY,
        (oldData: Partial<AccountSettings> | undefined) => ({
          ...oldData,
          ...updatedData,
        })
      );
      queryClient.invalidateQueries({ queryKey: ACCOUNT_SETTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
      toast.success(
        i18n.t(
          'settings.toast.stockUpdated',
          'Stock threshold updated successfully.'
        )
      );
    },
    onError: (err: unknown) => {
      console.error('Failed to update stock threshold:', err);
      const msg = getErrorMessage(err, 'Failed to update stock threshold');
      toast.error(msg);
    },
  });
};
