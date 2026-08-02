import type { BackendVendor, BackendVendorDetail } from '../../../services/vendors';
import type { Vendor, VendorStatus } from '../types/vendors';

/**
 * Maps a backend vendor object from list API to the UI Vendor data structure.
 * Missing or empty fields fallback to '--' per requirements.
 */
export function mapBackendVendorToVendor(v: BackendVendor): Vendor {
  const ownerName = [v.firstName, v.lastName].filter(Boolean).join(' ').trim() || '--';
  const businessName = v.storeName || ownerName || '--';

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
    : '--';

  const rawEmail = typeof v.email === 'string' && v.email.trim() ? v.email.trim() : undefined;
  const email = rawEmail || (v.commercialRegisterNumber ? `CR: ${v.commercialRegisterNumber}` : '--');

  const commRate =
    typeof v.commissionRate === 'number'
      ? v.commissionRate
      : typeof v.commissionRate === 'string'
      ? parseFloat(v.commissionRate) || undefined
      : undefined;

  return {
    id: v.id,
    businessName,
    owner: ownerName,
    email,
    submittedDate,
    category: v.isFeatured ? 'Featured' : '--',
    status,
    rawStatus: v.status,
    active,
    taxId: v.commercialRegisterNumber || '--',
    commissionRate: commRate,
    revenue: undefined,
    orders: undefined,
    createdAt: v.createdAt,
  };
}

/**
 * Maps a backend single vendor detail response to the UI Vendor data structure.
 * Missing or empty fields fallback to '--'.
 */
export function mapBackendVendorDetailToVendor(v: BackendVendorDetail): Vendor {
  const target: Partial<BackendVendorDetail> =
    (v as unknown as { data?: BackendVendorDetail })?.data || v || {};

  const ownerName = [target.firstName, target.lastName].filter(Boolean).join(' ').trim() || '--';
  const businessName = target.storeName || ownerName || '--';

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
    : '--';

  const joinedDate = target.approvedAt
    ? new Date(target.approvedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined;

  const rawEmail =
    typeof target.email === 'string' && target.email.trim()
      ? target.email.trim()
      : typeof target.publicEmail === 'string' && target.publicEmail.trim()
      ? target.publicEmail.trim()
      : undefined;

  const emailDisplay = rawEmail || (target.commercialRegisterNumber ? `CR: ${target.commercialRegisterNumber}` : '--');

  const phoneDisplay =
    typeof target.publicPhoneNumber === 'string' && target.publicPhoneNumber.trim()
      ? target.publicPhoneNumber.trim()
      : '--';

  const rawLogo = target.logoUrl;
  const logoUrl =
    typeof rawLogo === 'string' && rawLogo.trim()
      ? rawLogo.trim()
      : typeof (rawLogo as any)?.url === 'string' && (rawLogo as any).url.trim()
      ? (rawLogo as any).url.trim()
      : typeof (rawLogo as any)?.path === 'string' && (rawLogo as any).path.trim()
      ? (rawLogo as any).path.trim()
      : typeof (rawLogo as any)?.src === 'string' && (rawLogo as any).src.trim()
      ? (rawLogo as any).src.trim()
      : undefined;

  const storeDesc =
    typeof target.storeDescription === 'string' && target.storeDescription.trim()
      ? target.storeDescription.trim()
      : undefined;

  const rejReason =
    typeof target.rejectionReason === 'string' && target.rejectionReason.trim()
      ? target.rejectionReason.trim()
      : undefined;

  const deactReason =
    typeof target.deactivationReason === 'string' && target.deactivationReason.trim()
      ? target.deactivationReason.trim()
      : undefined;

  const commRate =
    typeof target.commissionRate === 'number'
      ? target.commissionRate
      : typeof target.commissionRate === 'string'
      ? parseFloat(target.commissionRate) || undefined
      : undefined;

  return {
    id: target.id || '',
    businessName,
    owner: ownerName,
    email: emailDisplay,
    phone: phoneDisplay,
    submittedDate,
    joinedDate,
    category: target.isFeatured ? 'Featured' : '--',
    status,
    rawStatus: (rawStatus as Vendor['rawStatus']) || 'PENDING_APPROVAL',
    active,
    taxId: target.commercialRegisterNumber || '--',
    description: storeDesc,
    rejectionReason: rejReason,
    deactivationReason: deactReason,
    suspendReason: deactReason,
    commissionRate: commRate,
    logoUrl,
    revenue: undefined,
    orders: undefined,
    createdAt: target.createdAt,
  };
}
