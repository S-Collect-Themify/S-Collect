import { create } from 'zustand';
import { EMPTY_CONTACT_US, EMPTY_LEGAL_PAGE, INITIAL_FAQ_CATEGORIES } from './data';
import type {
  ContactUsContent,
  DeleteFaqCategoryModalState,
  DeleteFaqItemModalState,
  EditorLanguage,
  FaqCategory,
  LegalPageContent,
  LegalPageType,
  StaticPageTab,
} from './types';

interface StaticPagesStore {
  activeTab: StaticPageTab;
  editorLanguage: EditorLanguage;

  contactUs: ContactUsContent;
  faqCategories: FaqCategory[];
  legalPages: Record<LegalPageType, LegalPageContent>;

  deleteFaqItemModal: DeleteFaqItemModalState;
  deleteFaqCategoryModal: DeleteFaqCategoryModalState;

  setActiveTab: (tab: StaticPageTab) => void;
  setEditorLanguage: (lang: EditorLanguage) => void;

  setContactUs: (content: ContactUsContent) => void;
  setFaqCategories: (categories: FaqCategory[]) => void;
  addFaqCategory: (category: FaqCategory) => void;
  updateFaqCategory: (id: string, updated: Partial<FaqCategory>) => void;
  removeFaqCategory: (id: string) => void;

  addFaqItem: (categoryId: string, item: FaqCategory['items'][number]) => void;
  updateFaqItem: (categoryId: string, itemId: string, updated: Partial<FaqCategory['items'][number]>) => void;
  removeFaqItem: (categoryId: string, itemId: string) => void;
  reorderFaqItems: (categoryId: string, items: FaqCategory['items']) => void;

  setLegalPage: (type: LegalPageType, content: LegalPageContent) => void;

  openDeleteFaqItemModal: (categoryId: string, item: FaqCategory['items'][number]) => void;
  closeDeleteFaqItemModal: () => void;
  openDeleteFaqCategoryModal: (category: FaqCategory) => void;
  closeDeleteFaqCategoryModal: () => void;
}

export const useStaticPagesStore = create<StaticPagesStore>((set) => ({
  activeTab: 'contact',
  editorLanguage: 'en',

  contactUs: EMPTY_CONTACT_US,
  faqCategories: INITIAL_FAQ_CATEGORIES,
  legalPages: {
    return: EMPTY_LEGAL_PAGE('return'),
    terms: EMPTY_LEGAL_PAGE('terms'),
    privacy: EMPTY_LEGAL_PAGE('privacy'),
  },

  deleteFaqItemModal: { open: false, categoryId: null, item: null },
  deleteFaqCategoryModal: { open: false, category: null },

  setActiveTab: (activeTab) => set({ activeTab }),
  setEditorLanguage: (editorLanguage) => set({ editorLanguage }),

  setContactUs: (contactUs) => set({ contactUs }),

  setFaqCategories: (faqCategories) => set({ faqCategories }),

  addFaqCategory: (category) =>
    set((state) => ({ faqCategories: [...state.faqCategories, category] })),

  updateFaqCategory: (id, updated) =>
    set((state) => ({
      faqCategories: state.faqCategories.map((cat) =>
        cat.id === id ? { ...cat, ...updated } : cat
      ),
    })),

  removeFaqCategory: (id) =>
    set((state) => ({
      faqCategories: state.faqCategories.filter((cat) => cat.id !== id),
      deleteFaqCategoryModal: { open: false, category: null },
    })),

  addFaqItem: (categoryId, item) =>
    set((state) => ({
      faqCategories: state.faqCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, item] } : cat
      ),
    })),

  updateFaqItem: (categoryId, itemId, updated) =>
    set((state) => ({
      faqCategories: state.faqCategories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((it) => (it.id === itemId ? { ...it, ...updated } : it)),
            }
          : cat
      ),
    })),

  removeFaqItem: (categoryId, itemId) =>
    set((state) => ({
      faqCategories: state.faqCategories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((it) => it.id !== itemId) }
          : cat
      ),
      deleteFaqItemModal: { open: false, categoryId: null, item: null },
    })),

  reorderFaqItems: (categoryId, items) =>
    set((state) => ({
      faqCategories: state.faqCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, items } : cat
      ),
    })),

  setLegalPage: (type, content) =>
    set((state) => ({
      legalPages: { ...state.legalPages, [type]: content },
    })),

  openDeleteFaqItemModal: (categoryId, item) =>
    set({ deleteFaqItemModal: { open: true, categoryId, item } }),

  closeDeleteFaqItemModal: () =>
    set({ deleteFaqItemModal: { open: false, categoryId: null, item: null } }),

  openDeleteFaqCategoryModal: (category) =>
    set({ deleteFaqCategoryModal: { open: true, category } }),

  closeDeleteFaqCategoryModal: () =>
    set({ deleteFaqCategoryModal: { open: false, category: null } }),
}));
