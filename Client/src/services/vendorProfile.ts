import { api, handleServiceError } from './api';

export interface VendorProfileApiResponse {
  id?: string;
  storeName?: string;
  storeNameAr?: string | Record<string, any> | null;
  storeDescription?: string | Record<string, any> | null;
  publicEmail?: string | Record<string, any> | null;
  publicPhoneNumber?: string | Record<string, any> | null;
  logoUrl?: string | Record<string, any> | null;
}

export interface UpdateVendorProfilePayload {
  storeName?: string;
  storeNameAr?: string;
  storeDescription?: string;
  publicEmail?: string;
  publicPhoneNumber?: string;
  logo?: File | null;
}

export interface BankInfoPayload {
  bankName: string;
  iban: string;
  accountHolderName: string;
}

export interface BankInfoResponse {
  bankName: string;
  ibanMasked: string;
  accountHolderName: string;
}

/**
  * GET /api/v1/vendor/profile
  * View store profile
  */
export const getVendorProfile = async (): Promise<VendorProfileApiResponse> => {
  try {
    const { data } = await api.get('/vendor/profile');
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor profile');
  }
};

/**
  * PATCH /api/v1/vendor/profile
  * Update store profile, optionally replacing store logo
  */
export const updateVendorProfile = async (
  payload: UpdateVendorProfilePayload
): Promise<VendorProfileApiResponse> => {
  try {
    const formData = new FormData();
    if (payload.storeName !== undefined) formData.append('storeName', payload.storeName);
    if (payload.storeNameAr !== undefined) formData.append('storeNameAr', payload.storeNameAr);
    if (payload.storeDescription !== undefined) formData.append('storeDescription', payload.storeDescription);
    if (payload.publicEmail !== undefined) formData.append('publicEmail', payload.publicEmail);
    if (payload.publicPhoneNumber !== undefined) formData.append('publicPhoneNumber', payload.publicPhoneNumber);
    if (payload.logo) {
      formData.append('logo', payload.logo);
    }

    const { data } = await api.patch('/vendor/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update vendor profile');
  }
};

/**
  * PATCH /api/v1/vendor/profile/bank-info
  * Update bank info (bank name, IBAN, account holder name) — full replace
  */
export const updateBankInfo = async (
  payload: BankInfoPayload
): Promise<BankInfoResponse> => {
  try {
    const { data } = await api.patch('/vendor/profile/bank-info', payload);
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update bank info');
  }
};
