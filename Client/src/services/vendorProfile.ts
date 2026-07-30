import { api, handleServiceError } from './api';

export interface VendorProfile {
  id: string;
  storeName: string;
  storeNameAr: string | null;
  storeDescription: string | null;
  publicEmail: string | null;
  publicPhoneNumber: string | null;
  logoUrl: string | null;
  // Defensive extensions in case bank info is returned in profile GET
  bankName?: string;
  ibanMasked?: string;
  accountHolderName?: string;
  bankInfo?: {
    bankName?: string;
    ibanMasked?: string;
    accountHolderName?: string;
  };
}

export interface BankInfoResponse {
  bankName: string;
  ibanMasked: string;
  accountHolderName: string;
}

export const getVendorProfile = async (): Promise<VendorProfile> => {
  try {
    const { data } = await api.get<VendorProfile>('/vendor/profile');
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor profile');
  }
};

export const updateVendorProfile = async (
  formData: FormData
): Promise<VendorProfile> => {
  try {
    const { data } = await api.patch<VendorProfile>(
      '/vendor/profile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update vendor profile');
  }
};

export interface UpdateVendorBankInfoParams {
  bankName?: string;
  iban?: string;
  accountHolderName?: string;
}

export const updateVendorBankInfo = async (
  bankInfo: UpdateVendorBankInfoParams
): Promise<BankInfoResponse> => {
  try {
    const { data } = await api.patch<BankInfoResponse>(
      '/vendor/profile/bank-info',
      bankInfo
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update bank information');
  }
};
