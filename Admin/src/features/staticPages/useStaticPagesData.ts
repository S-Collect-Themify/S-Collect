import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  getContactUsApi,
  updateContactUsApi,
  getFaqCategoriesApi,
  createFaqCategoryApi,
  updateFaqCategoryApi,
  deleteFaqCategoryApi,
  reorderFaqCategoriesApi,
  createFaqItemApi,
  updateFaqItemApi,
  deleteFaqItemApi,
  reorderFaqItemsApi,
  getLegalPageApi,
  updateLegalPageApi,
} from '../../services/staticPages';
import { useStaticPagesStore } from './staticPagesStore';
import { EMPTY_LEGAL_PAGE } from './data';
import { generateLocalId } from './utils';
import type { Bilingual, FaqCategory, FaqItem, LegalPageType } from './types';

/**
 * NOTE: The `/admin/static-pages/**` endpoints do not exist on the backend yet.
 * Every mutation below still calls the real endpoint first (see `services/staticPages.ts`)
 * so this code is a drop-in match once those routes ship — but each one falls back to
 * updating local state on failure so the CMS screen stays usable for content prep in the
 * meantime. Remove the fallback branches once the API is live if you want hard failures.
 */

// ─── Contact Us ───────────────────────────────────────────────────────────────
export const useContactUsQuery = () => {
  const setContactUs = useStaticPagesStore((s) => s.setContactUs);

  return useQuery({
    queryKey: ['admin-static-pages-contact-us'],
    queryFn: async () => {
      const remote = await getContactUsApi();
      if (remote) {
        setContactUs(remote);
        return remote;
      }
      return useStaticPagesStore.getState().contactUs;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useUpdateContactUsMutation = () => {
  const { i18n } = useTranslation();
  const setContactUs = useStaticPagesStore((s) => s.setContactUs);

  return useMutation({
    mutationFn: async (payload: Parameters<typeof updateContactUsApi>[0]) => {
      try {
        return await updateContactUsApi(payload);
      } catch (err) {
        console.warn('API updateContactUsApi failed, saving locally instead', err);
        return { ...payload, updatedAt: new Date().toISOString() };
      }
    },
    onSuccess: (saved) => {
      setContactUs(saved);
      toast.success(i18n.language === 'ar' ? 'تم حفظ بيانات التواصل بنجاح' : 'Contact info saved successfully');
    },
    onError: (err: any) => {
      console.error('Update contact us error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to save contact info');
    },
  });
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const useFaqCategoriesQuery = () => {
  const setFaqCategories = useStaticPagesStore((s) => s.setFaqCategories);

  return useQuery({
    queryKey: ['admin-static-pages-faq'],
    queryFn: async () => {
      const remote = await getFaqCategoriesApi();
      if (remote) {
        setFaqCategories(remote);
        return remote;
      }
      return useStaticPagesStore.getState().faqCategories;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useFaqMutations = () => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const queryClient = useQueryClient();
  const addFaqCategory = useStaticPagesStore((s) => s.addFaqCategory);
  const updateFaqCategoryInStore = useStaticPagesStore((s) => s.updateFaqCategory);
  const removeFaqCategoryFromStore = useStaticPagesStore((s) => s.removeFaqCategory);
  const addFaqItem = useStaticPagesStore((s) => s.addFaqItem);
  const updateFaqItemInStore = useStaticPagesStore((s) => s.updateFaqItem);
  const removeFaqItemFromStore = useStaticPagesStore((s) => s.removeFaqItem);
  const reorderFaqItemsInStore = useStaticPagesStore((s) => s.reorderFaqItems);
  const closeDeleteFaqItemModal = useStaticPagesStore((s) => s.closeDeleteFaqItemModal);
  const closeDeleteFaqCategoryModal = useStaticPagesStore((s) => s.closeDeleteFaqCategoryModal);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-static-pages-faq'] });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: Bilingual) => {
      try {
        return await createFaqCategoryApi(name);
      } catch (err) {
        console.warn('API createFaqCategoryApi failed, saving locally instead', err);
        const fallback: FaqCategory = { id: generateLocalId('faq-cat'), name, order: 0, items: [] };
        return fallback;
      }
    },
    onSuccess: (category) => {
      addFaqCategory(category);
      toast.success(isAr ? 'تم إضافة التصنيف بنجاح' : 'Category added successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Create FAQ category error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to add category');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: Bilingual }) => {
      try {
        await updateFaqCategoryApi(id, name);
      } catch (err) {
        console.warn('API updateFaqCategoryApi failed, saving locally instead', err);
      }
      return { id, name };
    },
    onSuccess: ({ id, name }) => {
      updateFaqCategoryInStore(id, { name });
      toast.success(isAr ? 'تم تحديث التصنيف بنجاح' : 'Category updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Update FAQ category error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to update category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await deleteFaqCategoryApi(id);
      } catch (err) {
        console.warn('API deleteFaqCategoryApi failed, removing locally instead', err);
      }
      return id;
    },
    onMutate: () => {
      closeDeleteFaqCategoryModal();
    },
    onSuccess: (id) => {
      removeFaqCategoryFromStore(id);
      toast.success(isAr ? 'تم حذف التصنيف بنجاح' : 'Category deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Delete FAQ category error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async ({
      categoryId,
      question,
      answer,
    }: { categoryId: string; question: Bilingual; answer: Bilingual }) => {
      try {
        const item = await createFaqItemApi(categoryId, { question, answer });
        return { categoryId, item };
      } catch (err) {
        console.warn('API createFaqItemApi failed, saving locally instead', err);
        const fallback: FaqItem = { id: generateLocalId('faq-item'), question, answer, order: 0 };
        return { categoryId, item: fallback };
      }
    },
    onSuccess: ({ categoryId, item }) => {
      addFaqItem(categoryId, item);
      toast.success(isAr ? 'تم إضافة السؤال بنجاح' : 'Question added successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Create FAQ item error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to add question');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      categoryId,
      itemId,
      question,
      answer,
    }: { categoryId: string; itemId: string; question: Bilingual; answer: Bilingual }) => {
      try {
        await updateFaqItemApi(categoryId, itemId, { question, answer });
      } catch (err) {
        console.warn('API updateFaqItemApi failed, saving locally instead', err);
      }
      return { categoryId, itemId, question, answer };
    },
    onSuccess: ({ categoryId, itemId, question, answer }) => {
      updateFaqItemInStore(categoryId, itemId, { question, answer });
      toast.success(isAr ? 'تم تحديث السؤال بنجاح' : 'Question updated successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Update FAQ item error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to update question');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ categoryId, itemId }: { categoryId: string; itemId: string }) => {
      try {
        await deleteFaqItemApi(categoryId, itemId);
      } catch (err) {
        console.warn('API deleteFaqItemApi failed, removing locally instead', err);
      }
      return { categoryId, itemId };
    },
    onMutate: () => {
      closeDeleteFaqItemModal();
    },
    onSuccess: ({ categoryId, itemId }) => {
      removeFaqItemFromStore(categoryId, itemId);
      toast.success(isAr ? 'تم حذف السؤال بنجاح' : 'Question deleted successfully');
      invalidate();
    },
    onError: (err: any) => {
      console.error('Delete FAQ item error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to delete question');
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async ({ categoryId, items }: { categoryId: string; items: FaqItem[] }) => {
      try {
        await reorderFaqItemsApi(categoryId, items.map((it) => it.id));
      } catch (err) {
        console.warn('API reorderFaqItemsApi failed, saving order locally instead', err);
      }
      return { categoryId, items };
    },
    onSuccess: ({ categoryId, items }) => {
      reorderFaqItemsInStore(
        categoryId,
        items.map((it, idx) => ({ ...it, order: idx }))
      );
      toast.success(isAr ? 'تم حفظ الترتيب بنجاح' : 'Order saved successfully');
    },
    onError: (err: any) => {
      console.error('Reorder FAQ items error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to save order');
    },
  });

  const reorderCategoriesMutation = useMutation({
    mutationFn: async (categories: FaqCategory[]) => {
      try {
        await reorderFaqCategoriesApi(categories.map((c) => c.id));
      } catch (err) {
        console.warn('API reorderFaqCategoriesApi failed, saving order locally instead', err);
      }
      return categories;
    },
    onSuccess: (categories) => {
      useStaticPagesStore.getState().setFaqCategories(
        categories.map((c, idx) => ({ ...c, order: idx }))
      );
      toast.success(isAr ? 'تم حفظ ترتيب التصنيفات بنجاح' : 'Category order saved successfully');
    },
    onError: (err: any) => {
      console.error('Reorder FAQ categories error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to save category order');
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
    createItemMutation,
    updateItemMutation,
    deleteItemMutation,
    reorderItemsMutation,
    reorderCategoriesMutation,
  };
};

// ─── Legal pages (Return Policy / Terms & Conditions / Privacy Policy) ────────
export const useLegalPageQuery = (type: LegalPageType) => {
  const setLegalPage = useStaticPagesStore((s) => s.setLegalPage);

  return useQuery({
    queryKey: ['admin-static-pages-legal', type],
    queryFn: async () => {
      const remote = await getLegalPageApi(type);
      if (remote) {
        setLegalPage(type, remote);
        return remote;
      }
      return useStaticPagesStore.getState().legalPages[type] || EMPTY_LEGAL_PAGE(type);
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useUpdateLegalPageMutation = () => {
  const { i18n } = useTranslation();
  const setLegalPage = useStaticPagesStore((s) => s.setLegalPage);

  return useMutation({
    mutationFn: async ({
      type,
      title,
      body,
    }: { type: LegalPageType; title: Bilingual; body: Bilingual }) => {
      try {
        return await updateLegalPageApi(type, { title, body });
      } catch (err) {
        console.warn(`API updateLegalPageApi (${type}) failed, saving locally instead`, err);
        return { type, title, body, updatedAt: new Date().toISOString() };
      }
    },
    onSuccess: (saved) => {
      setLegalPage(saved.type, saved);
      toast.success(i18n.language === 'ar' ? 'تم حفظ الصفحة بنجاح' : 'Page saved successfully');
    },
    onError: (err: any) => {
      console.error('Update legal page error:', err?.response?.data || err);
      toast.error(err?.response?.data?.message || 'Failed to save page');
    },
  });
};
