import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { PlatformSettings, BannerItem, AdminAccount, ShippingZoneItem, VendorShippingRate, AdminSettingsViewMode } from './types';
import { INITIAL_PLATFORM_SETTINGS, INITIAL_ADMINS, INITIAL_SHIPPING_ZONES, INITIAL_VENDOR_RATES } from './data';
import toast from 'react-hot-toast';
import i18n from '../../i18n';
import {
  getAdminBanners,
  createAdminBanner,
  updateAdminBanner,
  deleteAdminBanner,
  type BannerLinkType as ApiLinkType,
} from '../../services/banners';

interface AdminSettingsStore {
  platformSettings: PlatformSettings;
  banners: BannerItem[];
  bannersLoading: boolean;
  bannersError: string | null;
  admins: AdminAccount[];
  shippingZones: ShippingZoneItem[];
  vendorRates: VendorShippingRate[];
  selectedZoneForReport: ShippingZoneItem | null;
  viewMode: AdminSettingsViewMode;
  editingBanner: BannerItem | null;
  editingAdmin: AdminAccount | null;
  deleteModal: {
    open: boolean;
    banner: BannerItem | null;
  };
  deleteAdminModal: {
    open: boolean;
    admin: AdminAccount | null;
    isSuperAdminAlert: boolean;
  };
  emailExistsModal: {
    open: boolean;
  };
  disableZoneModal: {
    open: boolean;
    zone: ShippingZoneItem | null;
  };

  // Actions
  setViewMode: (mode: AdminSettingsViewMode) => void;
  setEditingBanner: (banner: BannerItem | null) => void;
  setEditingAdmin: (admin: AdminAccount | null) => void;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  
  // Banner API Actions
  fetchBanners: () => Promise<void>;
  createBannerApi: (data: {
    title: string;
    linkType: ApiLinkType;
    image: File;
    linkTargetId?: string;
    externalUrl?: string;
    startsAt?: string;
    endsAt?: string;
    sortOrder?: number;
  }) => Promise<boolean>;
  updateBannerApi: (id: string, data: {
    title?: string;
    linkType?: ApiLinkType;
    image?: File | null;
    linkTargetId?: string | null;
    externalUrl?: string | null;
    startsAt?: string | null;
    endsAt?: string | null;
    sortOrder?: number | null;
    isActive?: boolean;
  }) => Promise<boolean>;
  deleteBannerApi: (id: string) => Promise<void>;

  // Legacy Banner Actions (kept for compatibility)
  addBanner: (banner: Omit<BannerItem, 'id' | 'dateAdded'>) => boolean;
  updateBanner: (id: string, banner: Partial<BannerItem>) => boolean;
  toggleBannerStatus: (id: string) => void;
  reorderBanners: (oldIndex: number, newIndex: number) => void;
  openDeleteModal: (banner: BannerItem) => void;
  closeDeleteModal: () => void;
  confirmDeleteBanner: () => void;

  // Admin Actions
  addAdmin: (admin: Omit<AdminAccount, 'id' | 'dateAdded' | 'status'>) => boolean;
  updateAdmin: (id: string, admin: Partial<AdminAccount>) => boolean;
  openDeleteAdminModal: (admin: AdminAccount) => void;
  closeDeleteAdminModal: () => void;
  confirmDeleteAdmin: () => void;
  closeEmailExistsModal: () => void;

  // Shipping Zone Actions
  toggleShippingZoneStatus: (zone: ShippingZoneItem) => void;
  openDisableZoneModal: (zone: ShippingZoneItem) => void;
  closeDisableZoneModal: () => void;
  confirmDisableZone: () => void;
  viewZoneReport: (zone: ShippingZoneItem) => void;
}

export const MAX_ACTIVE_BANNERS = 5;

export const useAdminSettingsStore = create<AdminSettingsStore>((set, get) => ({
  platformSettings: INITIAL_PLATFORM_SETTINGS,
  banners: [],
  bannersLoading: false,
  bannersError: null,
  admins: INITIAL_ADMINS,
  shippingZones: INITIAL_SHIPPING_ZONES,
  vendorRates: INITIAL_VENDOR_RATES,
  selectedZoneForReport: INITIAL_SHIPPING_ZONES[0],
  viewMode: 'settings',
  editingBanner: null,
  editingAdmin: null,
  deleteModal: {
    open: false,
    banner: null,
  },
  deleteAdminModal: {
    open: false,
    admin: null,
    isSuperAdminAlert: false,
  },
  emailExistsModal: {
    open: false,
  },
  disableZoneModal: {
    open: false,
    zone: null,
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setEditingBanner: (banner) => set({ editingBanner: banner }),
  setEditingAdmin: (admin) => set({ editingAdmin: admin }),

  // ── Banner API Actions ──────────────────────────────────────────────────────
  fetchBanners: async () => {
    set({ bannersLoading: true, bannersError: null });
    try {
      const raw = await getAdminBanners();
      const mapped: BannerItem[] = raw.map((b) => ({
        id: b.id,
        name: b.title,
        redirectUrl: b.externalUrl || '',
        isActive: b.isActive,
        dateAdded: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        imageUrl: b.imageUrl,
        linkType: b.linkType,
        linkTargetId: b.linkTargetId,
        externalUrl: b.externalUrl,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        sortOrder: b.sortOrder,
      }));
      set({ banners: mapped, bannersLoading: false });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load banners';
      set({ bannersError: msg, bannersLoading: false });
    }
  },

  createBannerApi: async (data) => {
    try {
      const created = await createAdminBanner({
        title: data.title,
        linkType: data.linkType,
        image: data.image,
        linkTargetId: data.linkTargetId,
        externalUrl: data.externalUrl,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        sortOrder: data.sortOrder,
      });
      const newBanner: BannerItem = {
        id: created.id,
        name: created.title,
        redirectUrl: created.externalUrl || '',
        isActive: created.isActive,
        dateAdded: created.createdAt ? new Date(created.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        imageUrl: created.imageUrl,
        linkType: created.linkType,
        linkTargetId: created.linkTargetId,
        externalUrl: created.externalUrl,
        startsAt: created.startsAt,
        endsAt: created.endsAt,
        sortOrder: created.sortOrder,
      };
      set((state) => ({ banners: [newBanner, ...state.banners], viewMode: 'banners' }));
      toast.success(i18n.language === 'ar' ? 'تم إضافة البنر بنجاح' : 'Banner added successfully');
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create banner');
      return false;
    }
  },

  updateBannerApi: async (id, data) => {
    try {
      const updated = await updateAdminBanner(id, {
        title: data.title,
        linkType: data.linkType,
        image: data.image ?? undefined,
        linkTargetId: data.linkTargetId,
        externalUrl: data.externalUrl,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      });
      const updatedBanner: BannerItem = {
        id: updated.id,
        name: updated.title,
        redirectUrl: updated.externalUrl || '',
        isActive: updated.isActive,
        dateAdded: updated.createdAt ? new Date(updated.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        imageUrl: updated.imageUrl,
        linkType: updated.linkType,
        linkTargetId: updated.linkTargetId,
        externalUrl: updated.externalUrl,
        startsAt: updated.startsAt,
        endsAt: updated.endsAt,
        sortOrder: updated.sortOrder,
      };
      set((state) => ({
        banners: state.banners.map((b) => (b.id === id ? updatedBanner : b)),
        viewMode: 'banners',
        editingBanner: null,
      }));
      toast.success(i18n.language === 'ar' ? 'تم تحديث البنر بنجاح' : 'Banner updated successfully');
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update banner');
      return false;
    }
  },

  deleteBannerApi: async (id) => {
    try {
      await deleteAdminBanner(id);
      set((state) => ({
        banners: state.banners.filter((b) => b.id !== id),
        deleteModal: { open: false, banner: null },
      }));
      toast.success(i18n.language === 'ar' ? 'تم حذف البنر بنجاح' : 'Banner deleted successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete banner');
    }
  },

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

  addAdmin: (adminData) => {
    const { admins } = get();
    const existing = admins.find(
      (a) => a.email.toLowerCase().trim() === adminData.email.toLowerCase().trim()
    );
    if (existing) {
      set({ emailExistsModal: { open: true } });
      return false;
    }

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateFormatted = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    const newAdmin: AdminAccount = {
      ...adminData,
      id: String(Date.now()),
      status: 'Active',
      dateAdded: dateFormatted,
    };

    set((state) => ({
      admins: [newAdmin, ...state.admins],
      viewMode: 'admins',
    }));
    toast.success(
      i18n.language === 'ar' ? 'تم إضافة المسؤول بنجاح' : 'Admin added successfully'
    );
    return true;
  },

  updateAdmin: (id, adminData) => {
    const { admins } = get();
    if (adminData.email) {
      const existing = admins.find(
        (a) => a.id !== id && a.email.toLowerCase().trim() === adminData.email?.toLowerCase().trim()
      );
      if (existing) {
        set({ emailExistsModal: { open: true } });
        return false;
      }
    }

    set((state) => ({
      admins: state.admins.map((a) => (a.id === id ? { ...a, ...adminData } : a)),
      viewMode: 'admins',
      editingAdmin: null,
    }));
    toast.success(
      i18n.language === 'ar' ? 'تم تحديث المسؤول بنجاح' : 'Admin updated successfully'
    );
    return true;
  },

  openDeleteAdminModal: (admin) => {
    const isSuperAdminAlert = admin.role === 'Super Admin';
    set({
      deleteAdminModal: {
        open: true,
        admin,
        isSuperAdminAlert,
      },
    });
  },

  closeDeleteAdminModal: () => {
    set({
      deleteAdminModal: {
        open: false,
        admin: null,
        isSuperAdminAlert: false,
      },
    });
  },

  confirmDeleteAdmin: () => {
    const { deleteAdminModal } = get();
    if (deleteAdminModal.admin && !deleteAdminModal.isSuperAdminAlert) {
      const adminId = deleteAdminModal.admin.id;
      set((state) => ({
        admins: state.admins.filter((a) => a.id !== adminId),
        deleteAdminModal: { open: false, admin: null, isSuperAdminAlert: false },
      }));
      toast.success(
        i18n.language === 'ar' ? 'تم حذف المسؤول بنجاح' : 'Admin deleted successfully'
      );
    }
  },

  closeEmailExistsModal: () => {
    set({ emailExistsModal: { open: false } });
  },

  toggleShippingZoneStatus: (zone) => {
    if (zone.isActive) {
      set({ disableZoneModal: { open: true, zone } });
    } else {
      set((state) => ({
        shippingZones: state.shippingZones.map((z) =>
          z.id === zone.id ? { ...z, isActive: true } : z
        ),
      }));
      toast.success(
        i18n.language === 'ar' ? 'تم تفعيل المنطقة بنجاح' : 'Zone enabled successfully'
      );
    }
  },

  openDisableZoneModal: (zone) => {
    set({ disableZoneModal: { open: true, zone } });
  },

  closeDisableZoneModal: () => {
    set({ disableZoneModal: { open: false, zone: null } });
  },

  confirmDisableZone: () => {
    const { disableZoneModal } = get();
    if (disableZoneModal.zone) {
      const zoneId = disableZoneModal.zone.id;
      set((state) => ({
        shippingZones: state.shippingZones.map((z) =>
          z.id === zoneId ? { ...z, isActive: false } : z
        ),
        disableZoneModal: { open: false, zone: null },
      }));
      toast.success(
        i18n.language === 'ar' ? 'تم تعطيل المنطقة بنجاح' : 'Zone disabled successfully'
      );
    }
  },

  viewZoneReport: (zone) => {
    set({ selectedZoneForReport: zone, viewMode: 'shipping-rates' });
  },
}));


