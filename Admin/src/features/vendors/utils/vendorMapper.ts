import type { BackendVendor } from '../../../services/vendors';
import type { Vendor, VendorStatus } from '../types/vendors';

/**
 * Maps a backend vendor object to the UI Vendor data structure
 */
export function mapBackendVendorToVendor(v: BackendVendor): Vendor {
  const ownerName = [v.firstName, v.lastName].filter(Boolean).join(' ').trim() || 'N/A';
  const businessName = v.storeName || ownerName || 'Vendor';

  let status: VendorStatus = 'pending';
  let active = false;

  if (v.status === 'ACTIVE') {
    status = 'approved';
    active = true;
  } else if (v.status === 'DEACTIVATED') {
    status = 'approved';
    active = false;
  } else if (v.status === 'REJECTED') {
    status = 'suspended';
    active = false;
  } else if (v.status === 'PENDING_APPROVAL') {
    status = 'pending';
    active = false;
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
    active,
    taxId: v.commercialRegisterNumber,
    revenue: 0,
    orders: 0,
    createdAt: v.createdAt,
  };
}
