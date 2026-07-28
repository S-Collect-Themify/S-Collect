import type { BackendVendor, BackendVendorDetail } from '../../../services/vendors';
import type { Vendor, VendorStatus } from '../types/vendors';

/**
 * Maps a backend vendor object from list API to the UI Vendor data structure
 */
export function mapBackendVendorToVendor(v: BackendVendor): Vendor {
  const ownerName = [v.firstName, v.lastName].filter(Boolean).join(' ').trim() || 'N/A';
  const businessName = v.storeName || ownerName || 'Vendor';

  const rawStatus = v.status ? String(v.status).toUpperCase() : 'PENDING_APPROVAL';
  let status: VendorStatus = 'pending';
  let active = false;

  switch (rawStatus) {
    case 'ACTIVE':
    case 'APPROVED':
      status = 'approved';
      active = true;
      break;
    case 'DEACTIVATED':
    case 'SUSPENDED':
      status = 'approved';
      active = false;
      break;
    case 'REJECTED':
      status = 'suspended';
      active = false;
      break;
    case 'PENDING_APPROVAL':
    case 'PENDING':
    default:
      status = 'pending';
      active = false;
      break;
  }

  const submittedDate = v.createdAt
    ? new Date(v.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  return {
    id: v.id,
    businessName,
    owner: ownerName,
    email: v.commercialRegisterNumber ? `CR: ${v.commercialRegisterNumber}` : 'N/A',
    submittedDate,
    category: v.isFeatured ? 'Featured' : 'General',
    status,
    rawStatus: v.status,
    active,
    taxId: v.commercialRegisterNumber,
    revenue: 0,
    orders: 0,
    createdAt: v.createdAt,
  };
}

/**
 * Maps a backend single vendor detail response to the UI Vendor data structure
 */
export function mapBackendVendorDetailToVendor(v: BackendVendorDetail): Vendor {
  const target: BackendVendorDetail =
    (v as unknown as { data?: BackendVendorDetail })?.data || v || {};

  const ownerName = [target.firstName, target.lastName].filter(Boolean).join(' ').trim() || 'N/A';
  const businessName = target.storeName || ownerName || 'Vendor';

  const rawStatus = target.status ? String(target.status).toUpperCase() : 'PENDING_APPROVAL';

  let status: VendorStatus = 'pending';
  let active = false;

  switch (rawStatus as string) {
    case 'ACTIVE':
    case 'APPROVED':
      status = 'approved';
      active = true;
      break;
    case 'DEACTIVATED':
    case 'SUSPENDED':
      status = 'approved';
      active = false;
      break;
    case 'REJECTED':
      status = 'suspended';
      active = false;
      break;
    case 'PENDING_APPROVAL':
    case 'PENDING':
    default:
      status = 'pending';
      active = false;
      break;
  }

  const submittedDate = target.createdAt
    ? new Date(target.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const joinedDate = target.approvedAt
    ? new Date(target.approvedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  return {
    id: target.id || '',
    businessName,
    owner: ownerName,
    email: target.commercialRegisterNumber ? `CR: ${target.commercialRegisterNumber}` : 'N/A',
    submittedDate,
    joinedDate,
    category: target.isFeatured ? 'Featured' : 'General',
    status,
    rawStatus: (rawStatus as Vendor['rawStatus']) || 'PENDING_APPROVAL',
    active,
    taxId: target.commercialRegisterNumber,
    description: target.storeDescription || undefined,
    rejectionReason: target.rejectionReason || undefined,
    commissionRate: typeof target.commissionRate === 'number' ? target.commissionRate : undefined,
    revenue: 0,
    orders: 0,
    createdAt: target.createdAt,
  };
}
