import { getVendorProfile } from './vendorProfile';
import { getVendorOnboardingStatus } from './auth';
import { handleServiceError } from './api';
import {
  useInventorySettingsStore,
  DEFAULT_LOW_STOCK_THRESHOLD,
} from '../store/inventorySettingsStore';

export interface AccountSettings {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  lowStockThreshold?: number;
}

export const getAccountSettings = async (): Promise<AccountSettings> => {
  const getStoredLowStock = (): number => {
    if (typeof window === 'undefined') return DEFAULT_LOW_STOCK_THRESHOLD;
    try {
      const val = localStorage.getItem('vendor_low_stock_threshold');
      const parsed = val ? parseInt(val, 10) : DEFAULT_LOW_STOCK_THRESHOLD;
      return isNaN(parsed) || parsed < 1 ? DEFAULT_LOW_STOCK_THRESHOLD : parsed;
    } catch {
      return DEFAULT_LOW_STOCK_THRESHOLD;
    }
  };

  const currentThreshold = getStoredLowStock();
  useInventorySettingsStore.getState().setLowStockThreshold(currentThreshold);

  try {
    const profile = await getVendorProfile();
    const onboarding = await getVendorOnboardingStatus().catch(() => null);

    const storedFirstName =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendor_first_name')
        : null;
    const storedLastName =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendor_last_name')
        : null;

    return {
      firstName:
        storedFirstName || profile.firstName || onboarding?.firstName || '',
      lastName:
        storedLastName || profile.lastName || onboarding?.lastName || '',
      email: profile.email || onboarding?.email || '',
      phoneNumber: profile.phoneNumber || onboarding?.phoneNumber || '',
      lowStockThreshold: currentThreshold,
    };
  } catch (err) {
    try {
      const data = await getVendorOnboardingStatus();
      const storedFirstName =
        typeof window !== 'undefined'
          ? localStorage.getItem('vendor_first_name')
          : null;
      const storedLastName =
        typeof window !== 'undefined'
          ? localStorage.getItem('vendor_last_name')
          : null;

      return {
        firstName: storedFirstName || data.firstName || '',
        lastName: storedLastName || data.lastName || '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        lowStockThreshold: currentThreshold,
      };
    } catch {
      throw handleServiceError(err, 'Failed to fetch account settings');
    }
  }
};

export const updateAccountSettings = async (
  settings: Partial<AccountSettings>
): Promise<AccountSettings> => {
  if (typeof window !== 'undefined') {
    if (settings.firstName) {
      localStorage.setItem('vendor_first_name', settings.firstName);
    }
    if (settings.lastName) {
      localStorage.setItem('vendor_last_name', settings.lastName);
    }
    if (settings.lowStockThreshold !== undefined) {
      const validThreshold = Math.max(1, Math.floor(settings.lowStockThreshold));
      localStorage.setItem(
        'vendor_low_stock_threshold',
        String(validThreshold)
      );
      useInventorySettingsStore.getState().setLowStockThreshold(validThreshold);
    }
  }

  try {
    const { api } = await import('./api');
    const formData = new FormData();
    const res = await api
      .patch('/vendor/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .catch(() => null);

    const rawData = res?.data;

    const data =
      rawData && typeof rawData === 'object' && 'data' in rawData
        ? (rawData as any).data
        : rawData;

    return {
      firstName: settings.firstName || data?.firstName || '',
      lastName: settings.lastName || data?.lastName || '',
      email: settings.email || data?.email || '',
      phoneNumber: settings.phoneNumber || data?.phoneNumber || '',
      lowStockThreshold:
        settings.lowStockThreshold ??
        useInventorySettingsStore.getState().lowStockThreshold,
    };
  } catch (err) {
    console.warn('Backend update vendor profile fallback:', err);
    return settings as AccountSettings;
  }
};
