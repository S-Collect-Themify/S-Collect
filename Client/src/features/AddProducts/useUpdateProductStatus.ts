import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateProduct, deactivateProduct } from '../../services/products';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const useUpdateProductStatus = (productId?: string) => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return useMutation({
    mutationFn: async (enable: boolean) => {
      if (!productId) return;
      if (enable) {
        return await activateProduct(productId);
      } else {
        return await deactivateProduct(productId);
      }
    },
    onSuccess: (_, enable) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ['product', productId] });
        queryClient.invalidateQueries({ queryKey: ['product-details', productId] });
      }
      toast.success(
        enable
          ? isRtl
            ? 'تم تفعيل المنتج بنجاح!'
            : 'Product activated successfully!'
          : isRtl
            ? 'تم إلغاء تفعيل المنتج بنجاح!'
            : 'Product deactivated successfully!'
      );
    },
    onError: (error: any) => {
      toast.error(
        isRtl
          ? `فشل تغيير حالة المنتج: ${error.message || ''}`
          : `Failed to change product status: ${error.message || ''}`
      );
    },
  });
};
