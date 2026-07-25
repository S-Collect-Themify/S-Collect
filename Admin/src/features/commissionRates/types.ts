export type CommissionStatus = 'Active' | 'Default' | 'Custom' | 'Inactive';

export interface PlatformCommissionData {
  id: string;
  rate: number;
  lastUpdated: string;
}

export interface VendorCommissionItem {
  id: string;
  vendorName: string;
  rate: number;
  status: CommissionStatus;
  lastUpdated: string;
}

export interface CategoryCommissionItem {
  id: string;
  categoryName: string;
  rate: number;
  status: CommissionStatus;
  lastUpdated: string;
}

export interface EditModalTarget {
  type: 'platform' | 'vendor' | 'category';
  id: string;
  name: string;
  currentRate: number;
  currentStatus?: CommissionStatus;
}
