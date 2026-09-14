import type { BackendVendor, BackendVendorDetail } from '../../../services/vendors';
import type { Vendor, VendorStatus } from '../types/vendors';

function extractIsFeatured(v: any): boolean {
  if (!v || typeof v !== 'object') return false;
  const val = v.isFeatured ?? v.is_featured ?? v.featured ?? v.isFeaturedVendor;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
  return false;
}

/**
 * Maps a backend vendor object from list API to the UI Vendor data structure.
 * Missing or empty fields fallback to '--' per requirements.
 */
export function mapBackendVendorToVendor(v: BackendVendor | any, isAr?: boolean): Vendor {
  const fName = v.firstName || v.first_name || v.user?.firstName || v.user?.first_name || '';
  const lName = v.lastName || v.last_name || v.user?.lastName || v.user?.last_name || '';
  const ownerName = [fName, lName].filter(Boolean).join(' ').trim() || v.owner || v.ownerName || (typeof v.user === 'string' ? v.user : '') || '--';

  const storeAr = v.storeNameAr || v.store_name_ar || v.nameAr || v.name_ar || v.titleAr || v.title_ar || v.vendorNameAr || v.vendor_name_ar;
  const storeEn = v.storeName || v.storeNameEn || v.store_name || v.store_name_en || v.name || v.nameEn || v.name_en || v.title || v.titleEn || v.title_en || v.businessName || v.business_name || v.vendorName || v.vendor_name;

  const rawStore = isAr ? (storeAr || storeEn) : (storeEn || storeAr);
  const businessName = rawStore || (ownerName !== '--' ? ownerName : null) || (v.id ? `Vendor ${v.id.slice(-4)}` : '--');

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

  const rawSubmittedDate = v.submittedDate || v.createdAt;
  const submittedDate = rawSubmittedDate
    ? new Date(rawSubmittedDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '--';

  let rawEmail: string | undefined = undefined;
  if (typeof v.email === 'string' && v.email.trim()) {
    rawEmail = v.email.trim();
  } else if (v.email && typeof v.email === 'object') {
    const emailObj = v.email as Record<string, unknown>;
    const val = emailObj.email || emailObj.value || emailObj.en || emailObj.ar;
    if (typeof val === 'string' && val.trim()) {
      rawEmail = val.trim();
    }
  }
  const email = rawEmail || (v.commercialRegisterNumber ? `CR: ${v.commercialRegisterNumber}` : '--');

  const commRate =
    typeof v.commissionRate === 'number'
      ? v.commissionRate
      : typeof v.commissionRate === 'string'
      ? parseFloat(v.commissionRate) || undefined
      : undefined;

  const isFeatured = extractIsFeatured(v);

  let categoryName = '--';
  if (isFeatured) {
    categoryName = 'Featured';
  } else {
    const catObj = (v as any).category || (v as any).categoryObj || (v as any).storeCategory;
    if (typeof catObj === 'object' && catObj !== null) {
      categoryName = isAr
        ? (catObj.nameAr || catObj.name_ar || catObj.name || catObj.nameEn || '--')
        : (catObj.nameEn || catObj.name || catObj.nameAr || catObj.name_ar || '--');
    } else if (typeof catObj === 'string' && catObj.trim()) {
      categoryName = catObj.trim();
    } else {
      const rawCatAr = (v as any).categoryAr || (v as any).category_ar || (v as any).categoryNameAr || (v as any).categoryName_ar;
      const rawCatEn = (v as any).categoryEn || (v as any).category_en || (v as any).categoryName || (v as any).categoryNameEn;
      const rawCat = isAr ? (rawCatAr || rawCatEn) : (rawCatEn || rawCatAr);
      if (typeof rawCat === 'string' && rawCat.trim()) {
        categoryName = rawCat.trim();
      }
    }
  }

  return {
    id: v.id,
    businessName,
    owner: ownerName,
    email,
    submittedDate,
    category: categoryName,
    status,
    rawStatus: v.status,
    active,
    isFeatured,
    taxId: v.commercialRegisterNumber || '--',
    commissionRate: commRate,
    revenue: v.totalRevenue,
    orders: v.totalOrders,
    createdAt: v.createdAt || v.submittedDate,
    storeName: v.storeName,
    storeNameAr: (v as any).storeNameAr || (v as any).store_name_ar,
    firstName: v.firstName,
    lastName: v.lastName,
    name: (v as any).name,
    nameAr: (v as any).nameAr || (v as any).name_ar,
  };
}

/**
 * Maps a backend single vendor detail response to the UI Vendor data structure.
 * Missing or empty fields fallback to '--'.
 */
export function mapBackendVendorDetailToVendor(v: BackendVendorDetail | any, isAr?: boolean): Vendor {
  const target: any = (v as unknown as { data?: any })?.data || v || {};

  const fName = target.firstName || target.first_name || target.user?.firstName || target.user?.first_name || '';
  const lName = target.lastName || target.last_name || target.user?.lastName || target.user?.last_name || '';
  const ownerName = [fName, lName].filter(Boolean).join(' ').trim() || target.owner || target.ownerName || (typeof target.user === 'string' ? target.user : '') || '--';

  const storeAr = target.storeNameAr || target.store_name_ar || target.nameAr || target.name_ar || target.titleAr || target.title_ar || target.vendorNameAr || target.vendor_name_ar;
  const storeEn = target.storeName || target.storeNameEn || target.store_name || target.store_name_en || target.name || target.nameEn || target.name_en || target.title || target.titleEn || target.title_en || target.businessName || target.business_name || target.vendorName || target.vendor_name;

  const rawStore = isAr ? (storeAr || storeEn) : (storeEn || storeAr);
  const businessName = rawStore || (ownerName !== '--' ? ownerName : null) || (target.id ? `Vendor ${target.id.slice(-4)}` : '--');

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

  const isFeatured = extractIsFeatured(target);

  let categoryName = '--';
  if (isFeatured) {
    categoryName = 'Featured';
  } else {
    const catObj = (target as any).category || (target as any).categoryObj || (target as any).storeCategory;
    if (typeof catObj === 'object' && catObj !== null) {
      categoryName = isAr
        ? (catObj.nameAr || catObj.name_ar || catObj.name || catObj.nameEn || '--')
        : (catObj.nameEn || catObj.name || catObj.nameAr || catObj.name_ar || '--');
    } else if (typeof catObj === 'string' && catObj.trim()) {
      categoryName = catObj.trim();
    } else {
      const rawCatAr = (target as any).categoryAr || (target as any).category_ar || (target as any).categoryNameAr || (target as any).categoryName_ar;
      const rawCatEn = (target as any).categoryEn || (target as any).category_en || (target as any).categoryName || (target as any).categoryNameEn;
      const rawCat = isAr ? (rawCatAr || rawCatEn) : (rawCatEn || rawCatAr);
      if (typeof rawCat === 'string' && rawCat.trim()) {
        categoryName = rawCat.trim();
      }
    }
  }

  return {
    id: target.id || '',
    businessName,
    owner: ownerName,
    email: emailDisplay,
    phone: phoneDisplay,
    submittedDate,
    joinedDate,
    category: categoryName,
    status,
    rawStatus: (rawStatus as Vendor['rawStatus']) || 'PENDING_APPROVAL',
    active,
    isFeatured,
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
    storeName: target.storeName,
    storeNameAr: target.storeNameAr || (target as any).store_name_ar,
    firstName: target.firstName,
    lastName: target.lastName,
    name: (target as any).name,
    nameAr: (target as any).nameAr || (target as any).name_ar,
  };
}
