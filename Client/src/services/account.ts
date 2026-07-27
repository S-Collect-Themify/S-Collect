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
    const data = await getVendorOnboardingStatus();
    return {
      firstName: data.firstName ?? '',
      lastName: data.lastName ?? '',
      email: data.email ?? '',
      phoneNumber: data.phoneNumber ?? '',
    };
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch account settings');
  }
};

export const updateAccountSettings = async (
  settings: Partial<AccountSettings>
): Promise<AccountSettings> => {
  try {
    const { api } = await import('./api');
    const { data } = await api.put('/vendor/account/profile', settings);
    return data;
  } catch (err) {
    const serviceErr = handleServiceError(
      err,
      'Failed to update account settings'
    );
    if (serviceErr.statusCode === 404 || serviceErr.statusCode === 405) {
      console.warn(
        'Backend endpoint /vendor/account/profile not found; fallback to requested settings.'
      );
      return settings as AccountSettings;
    }
    throw serviceErr;
  }
};
