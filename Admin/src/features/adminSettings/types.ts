export interface PlatformSettings {
  name: string;
  logoUrl?: string;
  logoFileName?: string;
  currency: string;
  defaultLanguage: string;
}

export interface BannerItem {
  id: string;
  name: string;
  redirectUrl: string;
  isActive: boolean;
  dateAdded: string;
  imageUrl?: string;
  imageFileName?: string;
  imageDimensions?: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
  avatarFileName?: string;
  status: 'Active' | 'Inactive';
  dateAdded: string;
}

export interface ShippingZoneItem {
  id: string;
  name: string;
  vendorsCount: number;
  isActive: boolean;
}

export interface VendorShippingRate {
  id: string;
  vendorName: string;
  standardRate: number;
  expressRate: number;
  lastUpdated: string;
}

export type AdminSettingsViewMode =
  | 'settings'
  | 'banners'
  | 'banners-add'
  | 'banners-edit'
  | 'admins'
  | 'admins-add'
  | 'admins-edit'
  | 'shipping-zones'
  | 'shipping-rates';


