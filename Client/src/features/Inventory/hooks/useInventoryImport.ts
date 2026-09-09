import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  importVendorInventory,
  type InventoryImportResponse,
} from '../../../services/inventory';
import { getErrorMessage } from '../../../types/api';

export function useInventoryImport() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation<InventoryImportResponse, Error, File>({
    mutationFn: (file: File) => importVendorInventory(file),
    onSuccess: (data) => {
      // Invalidate queries so inventory and product lists reflect new stock
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-manage'] });
      queryClient.invalidateQueries({ queryKey: ['product-details'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardInventoryAlerts'] });
      queryClient.invalidateQueries({
        queryKey: ['dashboardInventoryProductsMap'],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboardTopSellingProducts'],
      });

      if (data.failed && data.failed.length === 0) {
        toast.success(
          t(
            'inventoryPage.importModal.successAll',
            `Successfully updated ${data.updated} variant(s)!`,
            { count: data.updated }
          )
        );
      } else if (data.updated > 0) {
        toast.success(
          t(
            'inventoryPage.importModal.successPartial',
            `Updated ${data.updated} variant(s), but ${data.failed.length} variant(s) failed.`,
            { updated: data.updated, failed: data.failed.length }
          )
        );
      } else {
        toast.error(
          t(
            'inventoryPage.importModal.failAll',
            'Failed to update variants. Please check error details below.'
          )
        );
      }
    },
    onError: (err: unknown) => {
      console.error('Failed to import inventory file:', err);
      toast.error(
        getErrorMessage(
          err,
          t(
            'inventoryPage.importModal.uploadError',
            'Failed to import inventory. Please check the file format.'
          )
        )
      );
    },
  });

  return mutation;
}
