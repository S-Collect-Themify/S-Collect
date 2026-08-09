export type VendorStatus = 'pending' | 'approved' | 'suspended';

export type VendorTab = 'pending' | 'all' | 'suspended';

export type ActiveFilter = 'all' | 'active' | 'inactive';

export interface Vendor {
  id: string;
  businessName: string;
  owner: string;
  email: string;
  submittedDate: string;
  category: string;
  status: VendorStatus;
  rawStatus?: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'DEACTIVATED';
  /** Only relevant for approved vendors */
  revenue?: number;
  orders?: number;
  active?: boolean;
  isFeatured?: boolean;
  // Extended detail fields
  phone?: string;
  location?: string;
  taxId?: string;
  joinedDate?: string;
  products?: number;
  totalDue?: number;
  invoices?: number;
  pendingPayout?: number;
  description?: string;
  suspendReason?: string;
  deactivationReason?: string;
  rejectionReason?: string;
  commissionRate?: number;
  logoUrl?: string;
  createdAt?: string;
}
