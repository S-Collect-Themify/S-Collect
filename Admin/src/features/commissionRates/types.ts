export type CommissionStatus = 'Custom' | 'Default';

export interface PlatformCommissionData {
  rate: number;
  lastUpdated: string;
}

export interface VendorCommissionItem {
  id: string;
  vendorName: string;
  /** The effective rate to display — either custom or the platform default */
  rate: number | null;
  /** Whether this vendor has a custom rate set */
  status: CommissionStatus;
  lastUpdated: string;
}

export interface CategoryCommissionItem {
  id: string;
  categoryName: string;
  /** The effective rate to display — either custom or the platform default */
  rate: number | null;
  /** Whether this category has a custom rate set */
  status: CommissionStatus;
  lastUpdated: string;
}

export interface EditModalTarget {
  type: 'platform' | 'vendor' | 'category';
  id: string;
  name: string;
  currentRate: number;
  currentStatus?: CommissionStatus;
  /** Whether a custom override exists (for vendor/category) */
  hasCustomRate?: boolean;
}
