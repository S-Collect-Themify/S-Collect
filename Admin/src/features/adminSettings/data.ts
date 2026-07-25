import type { PlatformSettings, BannerItem, AdminAccount, ShippingZoneItem, VendorShippingRate } from './types';

export const INITIAL_PLATFORM_SETTINGS: PlatformSettings = {
  name: 'CollectS',
  currency: 'SAR - Saudi Riyal',
  defaultLanguage: 'Arabic',
};

export const INITIAL_BANNERS: BannerItem[] = [
  {
    id: '1',
    name: 'Winter Sale Banner',
    redirectUrl: 'https://example.com/winter-sale',
    isActive: true,
    dateAdded: 'Oct 12, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=60',
    imageFileName: 'winter-sale-banner.png',
    imageDimensions: '1200 × 480 px',
  },
  {
    id: '2',
    name: 'Gadget Promo Banner',
    redirectUrl: 'https://promo.example.com/gadgets',
    isActive: true,
    dateAdded: 'Sep 28, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=60',
    imageFileName: 'gadget-promo-banner.png',
    imageDimensions: '1200 × 480 px',
  },
  {
    id: '3',
    name: 'New Collection Banner',
    redirectUrl: 'https://example.com/new-collection',
    isActive: false,
    dateAdded: 'Aug 15, 2026',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=60',
    imageFileName: 'new-collection-banner.png',
    imageDimensions: '1200 × 480 px',
  },
];

export const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@platform.com',
    role: 'Super Admin',
    status: 'Active',
    dateAdded: 'Oct 12, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Ahmed Al-Sudais',
    email: 'ahmed@platform.com',
    role: 'Admin',
    status: 'Active',
    dateAdded: 'Sep 28, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Monica Geller',
    email: 'monica.g@platform.com',
    role: 'Admin',
    status: 'Active',
    dateAdded: 'Aug 15, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Linus Torvalds',
    email: 'linus@platform.com',
    role: 'Admin',
    status: 'Active',
    dateAdded: 'Jul 04, 2026',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_SHIPPING_ZONES: ShippingZoneItem[] = [
  { id: '1', name: 'Riyadh Region', vendorsCount: 24, isActive: true },
  { id: '2', name: 'Makkah Region', vendorsCount: 18, isActive: true },
  { id: '3', name: 'Madinah Region', vendorsCount: 12, isActive: true },
  { id: '4', name: 'Qassim Region', vendorsCount: 8, isActive: true },
  { id: '5', name: 'Eastern Province Region', vendorsCount: 15, isActive: true },
  { id: '6', name: 'Asir Region', vendorsCount: 6, isActive: true },
  { id: '7', name: 'Tabuk Region', vendorsCount: 5, isActive: true },
  { id: '8', name: 'Hail Region', vendorsCount: 4, isActive: true },
  { id: '9', name: 'Northern Borders Region', vendorsCount: 2, isActive: true },
  { id: '10', name: 'Jazan Region', vendorsCount: 7, isActive: true },
  { id: '11', name: 'Najran Region', vendorsCount: 3, isActive: true },
  { id: '12', name: 'Al Baha Region', vendorsCount: 4, isActive: true },
  { id: '13', name: 'Al Jouf Region', vendorsCount: 4, isActive: true },
];

export const INITIAL_VENDOR_RATES: VendorShippingRate[] = [
  { id: '1', vendorName: 'Al-Rajhi Logistics', standardRate: 25, expressRate: 45, lastUpdated: 'Oct 15, 2026' },
  { id: '2', vendorName: 'Saudi Express', standardRate: 30, expressRate: 55, lastUpdated: 'Oct 15, 2026' },
  { id: '3', vendorName: 'Naqel Express', standardRate: 22, expressRate: 40, lastUpdated: 'Oct 15, 2026' },
  { id: '4', vendorName: 'SMSA Express', standardRate: 28, expressRate: 50, lastUpdated: 'Oct 15, 2026' },
  { id: '5', vendorName: 'Fetchr', standardRate: 35, expressRate: 60, lastUpdated: 'Oct 15, 2026' },
];


