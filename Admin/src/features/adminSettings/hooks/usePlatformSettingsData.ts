import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAdminSettingsStore } from '../store';
import {
  getPlatformLanguageApi,
  updatePlatformLanguageApi,
} from '../../../services/platformSettings';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import i18n from '../../../i18n';

export const usePlatformSettingsData = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminProfile();
  const platformSettings = useAdminSettingsStore((s) => s.platformSettings);
  const updatePlatformSettings = useAdminSettingsStore((s) => s.updatePlatformSettings);

  // ── GET Language Query ──
  const languageQuery = useQuery({
    queryKey: ['admin-platform-language'],
    queryFn: async () => {
      const lang = await getPlatformLanguageApi();
      if (lang) {
        updatePlatformSettings({ defaultLanguage: lang }, true);
        return lang;
      }
      return platformSettings.defaultLanguage;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── PUT Language Mutation (Super Admin only) ──
  const updateLanguageMutation = useMutation({
    mutationFn: async (newLang: string) => {
      if (!isSuperAdmin) {
        throw new Error(
          i18n.language === 'ar'
            ? 'غير مصرح لك بتغيير لغة المنصة'
            : 'You are not authorized to change the platform language'
        );
      }
      return await updatePlatformLanguageApi(newLang);
    },
    onSuccess: (_, newLang) => {
      updatePlatformSettings({ defaultLanguage: newLang }, true);
      queryClient.invalidateQueries({ queryKey: ['admin-platform-language'] });
      toast.success(
        i18n.language === 'ar'
          ? 'تم حفظ لغة المنصة بنجاح'
          : 'Platform language updated successfully'
      );
    },
    onError: (err: any) => {
      console.error('Update platform language error:', err?.response?.data || err);
      const resData = err?.response?.data;
      let errorText =
        i18n.language === 'ar'
          ? 'فشل تحديث لغة المنصة'
          : 'Failed to update platform language';

      if (Array.isArray(resData?.message)) {
        errorText = resData.message.join(', ');
      } else if (
        typeof resData?.message === 'string' &&
        resData.message !== 'Validation failed.'
      ) {
        errorText = resData.message;
      } else if (resData?.errors) {
        if (typeof resData.errors === 'string') {
          errorText = resData.errors;
        } else if (Array.isArray(resData.errors)) {
          errorText = resData.errors.join(', ');
        } else if (typeof resData.errors === 'object') {
          errorText = Object.values(resData.errors).flat().join(', ');
        }
      } else if (resData?.error && typeof resData.error === 'string') {
        errorText = resData.error;
      } else if (err?.message) {
        errorText = err.message;
      }

      toast.error(errorText);
    },
  });

  return {
    languageQuery,
    updateLanguageMutation,
    isSuperAdmin,
    defaultLanguage: platformSettings.defaultLanguage,
  };
};
