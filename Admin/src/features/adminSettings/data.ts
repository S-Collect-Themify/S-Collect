import type { PlatformSettings, AdminAccount, ShippingZoneItem } from './types';

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  defaultLanguage:
    typeof window !== 'undefined' && localStorage.getItem('lang') === 'ar'
      ? 'Arabic'
      : 'English',
};

export const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: '1',
    name: '--',
    email: '--',
    role: '--',
    status: 'Inactive',
    dateAdded: '--',
    phoneNumber: '--',
  }
];

export const INITIAL_SHIPPING_ZONES: ShippingZoneItem[] = [
  { id: '1', name: '--', vendorsCount: 0, isActive: false }
];
