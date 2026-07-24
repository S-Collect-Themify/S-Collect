import type { PlatformSettings, BannerItem } from './types';

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
