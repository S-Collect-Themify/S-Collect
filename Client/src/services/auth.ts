import { api, handleServiceError } from './api';

export const login = async (email: string, password: string) => {
  try {
    const { data } = await api.post('/vendor/auth/login', {
      email,
      password,
    });

    return data;
  } catch (err) {
    throw handleServiceError(err, 'Login failed');
  }
};

export const verifyPhone = async (email: string, code: string) => {
  try {
    const { data } = await api.post('/vendor/auth/verify-phone', {
      email,
      code,
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Phone verification failed');
  }
};

export const resendOtp = async (email: string) => {
  try {
    const { data } = await api.post('/vendor/auth/resend-otp', { email });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to resend OTP');
  }
};

export const refresh = async (refreshToken: string) => {
  try {
    const { data } = await api.post('/vendor/auth/refresh', { refreshToken });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Token refresh failed');
  }
};

export const logout = async (refreshToken: string) => {
  try {
    const { data } = await api.post('/vendor/auth/logout', { refreshToken });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Logout failed');
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const { data } = await api.post('/vendor/auth/forgot-password', { email });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Forgot password request failed');
  }
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
) => {
  try {
    const { data } = await api.post('/vendor/auth/reset-password', {
      email,
      code,
      newPassword,
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Password reset failed');
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  try {
    const { data } = await api.post('/vendor/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Password change failed');
  }
};

export const changeEmail = async (newEmail: string) => {
  try {
    const { data } = await api.post('/vendor/auth/change-email', { newEmail });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Email change request failed');
  }
};

export const confirmChangeEmail = async (
  code: string,
  refreshToken: string
) => {
  try {
    const { data } = await api.post('/vendor/auth/confirm-change-email', {
      code,
      refreshToken,
    });
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Email change confirmation failed');
  }
};

export interface OnboardingApplyParams {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  storeName: string;
  storeDescription: string;
  commercialRegisterNumber: string;
}

export const applyVendorOnboarding = async (params: OnboardingApplyParams) => {
  try {
    const { data } = await api.post('/vendor/onboarding/apply', params);
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Vendor onboarding application failed');
  }
};

export const getToken = (): string | null => localStorage.getItem('token');
export const getRefreshToken = (): string | null =>
  localStorage.getItem('refreshToken');
export const clearTokens = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

export type VendorStatus =
  | 'APPROVED'
  | 'ACTIVE'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'DEACTIVATED'
  | string;

export const VENDOR_STATUS = {
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  REJECTED: 'REJECTED',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export interface VendorStatusResponse {
  status: VendorStatus;
  rejectionReason?: any;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  storeName?: string;
  storeDescription?: string;
  commercialRegisterNumber?: string;
}

export const getVendorOnboardingStatus =
  async (): Promise<VendorStatusResponse> => {
    try {
      const { data } = await api.get('/vendor/onboarding/status');
      return data;
    } catch (err) {
      throw handleServiceError(err, 'Failed to fetch onboarding status');
    }
  };
