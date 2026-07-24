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
