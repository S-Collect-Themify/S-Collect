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

export type AdminSettingsViewMode = 'settings' | 'banners' | 'banners-add' | 'banners-edit';
