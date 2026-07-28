export interface StoreProfileData {
  id?: string;
  storeName: string;
  storeNameAr?: string;
  storeDescription: string;
  publicEmail: string;
  phoneNumber: string;
  storeLogoUrl: string | null;
  storeLogoFileName: string | null;
  logoFile?: File | null;
}

export interface BankAccountData {
  bankName: string;
  iban: string;
  accountHolderName: string;
  ibanMasked?: string;
}

export interface AccountSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}
