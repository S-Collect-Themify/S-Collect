import { api } from './api';
import type {
  Bilingual,
  ContactUsContent,
  FaqCategory,
  FaqItem,
  LegalPageContent,
  LegalPageType,
} from '../features/staticPages/types';

/**
 * Static Pages (CMS) service — Contact Us / FAQ / Return Policy / Terms & Conditions / Privacy Policy.
 *
 * NOTE: The backend for this module does not exist yet. Every call below already targets the
 * endpoint shape the storefront CMS is expected to expose (`/admin/static-pages/**`), but is
 * wrapped defensively so the admin UI keeps working off local state until those routes ship —
 * once the API is live these functions need no further changes on the frontend side.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────────
const toBilingual = (raw: any, fallback: Bilingual = { en: '', ar: '' }): Bilingual => {
  if (!raw || typeof raw !== 'object') return fallback;
  return {
    en: raw.en ?? raw.En ?? raw.EN ?? fallback.en,
    ar: raw.ar ?? raw.Ar ?? raw.AR ?? fallback.ar,
  };
};

// ─── Contact Us ───────────────────────────────────────────────────────────────
export const getContactUsApi = async (): Promise<ContactUsContent | null> => {
  try {
    const { data } = await api.get('/admin/static-pages/contact-us');
    const raw = data?.data || data;
    if (!raw || typeof raw !== 'object') return null;

    return {
      email: raw.email || '',
      phone: raw.phone || '',
      whatsapp: raw.whatsapp || '',
      address: toBilingual(raw.address),
      workingHours: toBilingual(raw.workingHours),
      socialLinks: {
        facebook: raw.socialLinks?.facebook || '',
        instagram: raw.socialLinks?.instagram || '',
        x: raw.socialLinks?.x || raw.socialLinks?.twitter || '',
        tiktok: raw.socialLinks?.tiktok || '',
      },
      mapUrl: raw.mapUrl || '',
      updatedAt: raw.updatedAt,
    };
  } catch (err) {
    console.warn('API getContactUsApi fallback to local data', err);
    return null;
  }
};

export const updateContactUsApi = async (payload: ContactUsContent): Promise<ContactUsContent> => {
  const { data } = await api.put('/admin/static-pages/contact-us', payload);
  const raw = data?.data || data;
  return { ...payload, updatedAt: raw?.updatedAt || new Date().toISOString() };
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────
const mapFaqItem = (raw: any, order: number): FaqItem => ({
  id: String(raw?.id || raw?._id || ''),
  question: toBilingual(raw?.question),
  answer: toBilingual(raw?.answer),
  order: raw?.order ?? order,
});

const mapFaqCategory = (raw: any, order: number): FaqCategory => ({
  id: String(raw?.id || raw?._id || ''),
  name: toBilingual(raw?.name),
  order: raw?.order ?? order,
  items: Array.isArray(raw?.items) ? raw.items.map((it: any, idx: number) => mapFaqItem(it, idx)) : [],
});

export const getFaqCategoriesApi = async (): Promise<FaqCategory[] | null> => {
  try {
    const { data } = await api.get('/admin/static-pages/faq');
    const raw = data?.data || data;
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.categories) ? raw.categories : null;
    if (!list) return null;
    return list.map((cat: any, idx: number) => mapFaqCategory(cat, idx));
  } catch (err) {
    console.warn('API getFaqCategoriesApi fallback to local data', err);
    return null;
  }
};

export const createFaqCategoryApi = async (name: Bilingual): Promise<FaqCategory> => {
  const { data } = await api.post('/admin/static-pages/faq/categories', { name });
  const raw = data?.data || data;
  return mapFaqCategory(raw, 0);
};

export const updateFaqCategoryApi = async (id: string, name: Bilingual): Promise<void> => {
  await api.put(`/admin/static-pages/faq/categories/${id}`, { name });
};

export const deleteFaqCategoryApi = async (id: string): Promise<void> => {
  await api.delete(`/admin/static-pages/faq/categories/${id}`);
};

export const reorderFaqCategoriesApi = async (orderedIds: string[]): Promise<void> => {
  await api.put('/admin/static-pages/faq/categories/reorder', { orderedIds });
};

export const createFaqItemApi = async (
  categoryId: string,
  payload: { question: Bilingual; answer: Bilingual }
): Promise<FaqItem> => {
  const { data } = await api.post(`/admin/static-pages/faq/categories/${categoryId}/items`, payload);
  const raw = data?.data || data;
  return mapFaqItem(raw, 0);
};

export const updateFaqItemApi = async (
  categoryId: string,
  itemId: string,
  payload: { question: Bilingual; answer: Bilingual }
): Promise<void> => {
  await api.put(`/admin/static-pages/faq/categories/${categoryId}/items/${itemId}`, payload);
};

export const deleteFaqItemApi = async (categoryId: string, itemId: string): Promise<void> => {
  await api.delete(`/admin/static-pages/faq/categories/${categoryId}/items/${itemId}`);
};

export const reorderFaqItemsApi = async (categoryId: string, orderedIds: string[]): Promise<void> => {
  await api.put(`/admin/static-pages/faq/categories/${categoryId}/items/reorder`, { orderedIds });
};

// ─── Legal pages (Return Policy / Terms & Conditions / Privacy Policy) ────────
export const getLegalPageApi = async (type: LegalPageType): Promise<LegalPageContent | null> => {
  try {
    const { data } = await api.get(`/admin/static-pages/legal/${type}`);
    const raw = data?.data || data;
    if (!raw || typeof raw !== 'object') return null;

    return {
      type,
      title: toBilingual(raw.title),
      body: toBilingual(raw.body),
      updatedAt: raw.updatedAt,
    };
  } catch (err) {
    console.warn(`API getLegalPageApi (${type}) fallback to local data`, err);
    return null;
  }
};

export const updateLegalPageApi = async (
  type: LegalPageType,
  payload: { title: Bilingual; body: Bilingual }
): Promise<LegalPageContent> => {
  const { data } = await api.put(`/admin/static-pages/legal/${type}`, payload);
  const raw = data?.data || data;
  return {
    type,
    title: payload.title,
    body: payload.body,
    updatedAt: raw?.updatedAt || new Date().toISOString(),
  };
};
