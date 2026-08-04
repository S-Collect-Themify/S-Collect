import type { PlatformSettings, AdminAccount, ShippingZoneItem, VendorShippingRate } from './types';

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  defaultLanguage: 'Arabic',
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

export const INITIAL_VENDOR_RATES: VendorShippingRate[] = [
  { id: '1', vendorName: '--', standardRate: 0, expressRate: 0, lastUpdated: '--' }
];
