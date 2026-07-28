import { api, handleServiceError } from './api';

<<<<<<< HEAD
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
=======
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
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
}

export interface BankInfoResponse {
  bankName: string;
  ibanMasked: string;
  accountHolderName: string;
}

<<<<<<< HEAD
/**
  * GET /api/v1/vendor/profile
  * View store profile
  */
export const getVendorProfile = async (): Promise<VendorProfileApiResponse> => {
  try {
    const { data } = await api.get('/vendor/profile');
    console.log('[Vendor Profile] GET /api/v1/vendor/profile response:', data);
=======
export const getVendorProfile = async (): Promise<VendorProfile> => {
  try {
    const { data } = await api.get<VendorProfile>('/vendor/profile');
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor profile');
  }
};

<<<<<<< HEAD
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
=======
export const updateVendorProfile = async (
  formData: FormData
): Promise<VendorProfile> => {
  try {
    const { data } = await api.patch<VendorProfile>('/vendor/profile', formData, {
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
<<<<<<< HEAD
    console.log('[Vendor Profile] PATCH /api/v1/vendor/profile response:', data);
=======
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update vendor profile');
  }
};

<<<<<<< HEAD
/**
  * PATCH /api/v1/vendor/profile/bank-info
  * Update bank info (bank name, IBAN, account holder name) — full replace
  */
export const updateBankInfo = async (
  payload: BankInfoPayload
): Promise<BankInfoResponse> => {
  try {
    const { data } = await api.patch('/vendor/profile/bank-info', payload);
    console.log('[Vendor Profile] PATCH /api/v1/vendor/profile/bank-info response:', data);
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to update bank info');
=======
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
>>>>>>> 4f2a744b5a6cfedce0edc3751dc4020621939ed8
  }
};
