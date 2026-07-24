import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { PlatformSettings, BannerItem, AdminSettingsViewMode } from './types';
import { INITIAL_PLATFORM_SETTINGS, INITIAL_BANNERS } from './data';
import toast from 'react-hot-toast';
import i18n from '../../i18n';

interface AdminSettingsStore {
  platformSettings: PlatformSettings;
  banners: BannerItem[];
  viewMode: AdminSettingsViewMode;
  editingBanner: BannerItem | null;
  deleteModal: {
    open: boolean;
    banner: BannerItem | null;
  };

  // Actions
  setViewMode: (mode: AdminSettingsViewMode) => void;
  setEditingBanner: (banner: BannerItem | null) => void;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  
  // Banner Actions
  addBanner: (banner: Omit<BannerItem, 'id' | 'dateAdded'>) => boolean;
  updateBanner: (id: string, banner: Partial<BannerItem>) => boolean;
  toggleBannerStatus: (id: string) => void;
  reorderBanners: (oldIndex: number, newIndex: number) => void;
  openDeleteModal: (banner: BannerItem) => void;
  closeDeleteModal: () => void;
  confirmDeleteBanner: () => void;
}

export const MAX_ACTIVE_BANNERS = 5;

export const useAdminSettingsStore = create<AdminSettingsStore>((set, get) => ({
  platformSettings: INITIAL_PLATFORM_SETTINGS,
  banners: INITIAL_BANNERS,
  viewMode: 'settings',
  editingBanner: null,
  deleteModal: {
    open: false,
    banner: null,
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setEditingBanner: (banner) => set({ editingBanner: banner }),

  updatePlatformSettings: (newSettings) => {
    set((state) => ({
      platformSettings: { ...state.platformSettings, ...newSettings },
    }));
    toast.success(
      i18n.language === 'ar'
        ? 'تم حفظ إعدادات المنصة بنجاح'
        : 'Platform settings saved successfully'
    );
  },

  addBanner: (bannerData) => {
    const { banners } = get();
    const activeCount = banners.filter((b) => b.isActive).length;

    if (bannerData.isActive && activeCount >= MAX_ACTIVE_BANNERS) {
      const errMsg =
        i18n.language === 'ar'
          ? 'لا يمكن تفعيل أكثر من 5 بنرات في نفس الوقت.'
          : 'Cannot activate more than 5 banners at the same time.';
      toast.error(errMsg);
      return false;
    }

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateFormatted = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const newBanner: BannerItem = {
      ...bannerData,
      id: String(Date.now()),
      dateAdded: dateFormatted,
    };

    set((state) => ({
      banners: [newBanner, ...state.banners],
      viewMode: 'banners',
    }));
    toast.success(
      i18n.language === 'ar' ? 'تم إضافة البنر بنجاح' : 'Banner added successfully'
    );
    return true;
  },

  updateBanner: (id, bannerData) => {
    const { banners } = get();
    const existing = banners.find((b) => b.id === id);

    if (bannerData.isActive && !existing?.isActive) {
      const activeCount = banners.filter((b) => b.isActive).length;
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        const errMsg =
          i18n.language === 'ar'
            ? 'لا يمكن تفعيل أكثر من 5 بنرات في نفس الوقت.'
            : 'Cannot activate more than 5 banners at the same time.';
        toast.error(errMsg);
        return false;
      }
    }

    set((state) => ({
      banners: state.banners.map((b) => (b.id === id ? { ...b, ...bannerData } : b)),
      viewMode: 'banners',
      editingBanner: null,
    }));
    toast.success(
      i18n.language === 'ar' ? 'تم تحديث البنر بنجاح' : 'Banner updated successfully'
    );
    return true;
  },

  toggleBannerStatus: (id) => {
    const { banners } = get();
    const target = banners.find((b) => b.id === id);
    if (!target) return;

    if (!target.isActive) {
      const activeCount = banners.filter((b) => b.isActive).length;
      if (activeCount >= MAX_ACTIVE_BANNERS) {
        const errMsg =
          i18n.language === 'ar'
            ? 'لا يمكن تفعيل أكثر من 5 بنرات في نفس الوقت.'
            : 'Cannot activate more than 5 banners at the same time.';
        toast.error(errMsg);
        return;
      }
    }

    set((state) => ({
      banners: state.banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b)),
    }));
    toast.success(
      i18n.language === 'ar' ? 'تم تغيير حالة البنر' : 'Banner status updated'
    );
  },

  reorderBanners: (oldIndex, newIndex) => {
    set((state) => ({
      banners: arrayMove(state.banners, oldIndex, newIndex),
    }));
  },

  openDeleteModal: (banner) => {
    set({ deleteModal: { open: true, banner } });
  },

  closeDeleteModal: () => {
    set({ deleteModal: { open: false, banner: null } });
  },

  confirmDeleteBanner: () => {
    const { deleteModal } = get();
    if (deleteModal.banner) {
      const bannerId = deleteModal.banner.id;
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== bannerId),
        deleteModal: { open: false, banner: null },
      }));
      toast.success(
        i18n.language === 'ar' ? 'تم حذف البنر بنجاح' : 'Banner deleted successfully'
      );
    }
  },
}));
