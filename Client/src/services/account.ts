import { getVendorProfile } from './vendorProfile';
import { getVendorOnboardingStatus, getStoredUserEmail } from './auth';
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

  const storedEmail = getStoredUserEmail();

  try {
    const rawProfile = await getVendorProfile();
    const profile: any =
      rawProfile && typeof rawProfile === 'object' && 'data' in rawProfile
        ? (rawProfile as any).data
        : rawProfile;

    const rawOnboarding = await getVendorOnboardingStatus().catch(() => null);
    const onboarding: any =
      rawOnboarding &&
      typeof rawOnboarding === 'object' &&
      'data' in rawOnboarding
        ? (rawOnboarding as any).data
        : rawOnboarding;

    const storedFirstName =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendor_first_name')
        : null;
    const storedLastName =
      typeof window !== 'undefined'
        ? localStorage.getItem('vendor_last_name')
        : null;

    const resolvedEmail =
      storedEmail ||
      profile?.email ||
      profile?.user?.email ||
      profile?.publicEmail ||
      onboarding?.email ||
      onboarding?.user?.email ||
      '';

    if (
      resolvedEmail &&
      typeof window !== 'undefined' &&
      !localStorage.getItem('user_email')
    ) {
      try {
        localStorage.setItem('user_email', resolvedEmail);
      } catch {
        // ignore
      }
    }

    return {
      firstName:
        storedFirstName ?? profile?.firstName ?? onboarding?.firstName ?? '',
      lastName:
        storedLastName ?? profile?.lastName ?? onboarding?.lastName ?? '',
      email: resolvedEmail,
      phoneNumber:
        profile?.phoneNumber ??
        profile?.publicPhoneNumber ??
        onboarding?.phoneNumber ??
        '',
      lowStockThreshold: currentThreshold,
    };
  } catch (err) {
    try {
      const rawData = await getVendorOnboardingStatus();
      const data: any =
        rawData && typeof rawData === 'object' && 'data' in rawData
          ? (rawData as any).data
          : rawData;

      const storedFirstName =
        typeof window !== 'undefined'
          ? localStorage.getItem('vendor_first_name')
          : null;
      const storedLastName =
        typeof window !== 'undefined'
          ? localStorage.getItem('vendor_last_name')
          : null;

      const resolvedEmail =
        storedEmail ||
        data?.email ||
        data?.user?.email ||
        '';

      if (
        resolvedEmail &&
        typeof window !== 'undefined' &&
        !localStorage.getItem('user_email')
      ) {
        try {
          localStorage.setItem('user_email', resolvedEmail);
        } catch {
          // ignore
        }
      }

      return {
        firstName: storedFirstName ?? data?.firstName ?? '',
        lastName: storedLastName ?? data?.lastName ?? '',
        email: resolvedEmail,
        phoneNumber: data?.phoneNumber ?? '',
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
    if (settings.firstName !== undefined) {
      localStorage.setItem('vendor_first_name', settings.firstName);
    }
    if (settings.lastName !== undefined) {
      localStorage.setItem('vendor_last_name', settings.lastName);
    }
    if (settings.email) {
      localStorage.setItem('user_email', settings.email);
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
