export interface PlatformSettings {
  logoUrl?: string;
  logoFileName?: string;
  defaultLanguage: string;
}

export type BannerLinkType = 'CATEGORY' | 'PRODUCT' | 'VENDOR' | 'EXTERNAL_URL';

export interface BannerItem {
  id: string;
  name: string;
  redirectUrl: string;
  isActive: boolean;
  dateAdded: string;
  imageUrl?: string;
  imageFileName?: string;
  imageDimensions?: string;
  // API fields
  linkType?: BannerLinkType;
  linkTargetId?: string | null;
  externalUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder?: number | null;
}

export interface AdminAccount {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
  avatarFileName?: string;
  status?: 'Active' | 'Inactive' | '';
  dateAdded: string;
}

export interface ShippingZoneItem {
  id: string;
  name: string;
  code?: string;
  nameEn?: string;
  nameAr?: string;
  vendorsCount: number;
  vendorCount?: number;
  isActive: boolean;
}

export type AdminSettingsViewMode =
  | 'settings'
  | 'banners'
  | 'banners-add'
  | 'banners-edit'
  | 'admins'
  | 'admins-add'
  | 'admins-edit'
  | 'shipping-zones';
