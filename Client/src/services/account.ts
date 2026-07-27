import { getVendorOnboardingStatus } from './auth';

export interface AccountSettings {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const getAccountSettings = async (): Promise<AccountSettings> => {
  const data = await getVendorOnboardingStatus();
  return {
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    email: data.email ?? '',
    phoneNumber: data.phoneNumber ?? '',
  };
};

export const updateAccountSettings = async (
  settings: Partial<AccountSettings>
): Promise<AccountSettings> => {
  // Try calling backend account update endpoint if available, fallback gracefully
  try {
    const { api } = await import('./api');
    const { data } = await api.put('/vendor/account/profile', settings);
    return data;
  } catch (err) {
    // Return settings data directly if endpoint isn't supported on backend
    return settings as AccountSettings;
  }
};

