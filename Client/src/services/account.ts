import { getVendorProfile } from './vendorProfile';
import { getVendorOnboardingStatus } from './auth';
import { handleServiceError } from './api';

export interface AccountSettings {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const getAccountSettings = async (): Promise<AccountSettings> => {
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
  }

  try {
    const { api } = await import('./api');
    const formData = new FormData();
    if (settings.firstName) formData.append('firstName', settings.firstName);
    if (settings.lastName) formData.append('lastName', settings.lastName);

    const { data: rawData } = await api
      .patch('/vendor/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .catch(() => null);

    const data =
      rawData && typeof rawData === 'object' && 'data' in rawData
        ? (rawData as any).data
        : rawData;

    return {
      firstName: settings.firstName || data?.firstName || '',
      lastName: settings.lastName || data?.lastName || '',
      email: settings.email || data?.email || '',
      phoneNumber: settings.phoneNumber || data?.phoneNumber || '',
    };
  } catch (err) {
    console.warn('Backend update vendor profile fallback:', err);
    return settings as AccountSettings;
  }
};
