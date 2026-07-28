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
