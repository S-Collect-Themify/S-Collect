import { useTranslation } from 'react-i18next';
import { Card, getInitials } from './VendorDetailsCards';
import { useVendorDetailsStore } from '../store/useVendorDetailsStore';
import type { Vendor } from '../types/vendors';

interface VendorOverviewCardProps {
  vendor: Vendor;
}

export default function VendorOverviewCard({ vendor }: VendorOverviewCardProps) {
  const { t } = useTranslation();
  const { openSuspend, openActivate, openReject, openApprove } = useVendorDetailsStore();

  const initials = getInitials(vendor.businessName);
  const rawStatus = vendor.rawStatus
    ? String(vendor.rawStatus).toUpperCase()
    : vendor.active
    ? 'ACTIVE'
    : 'PENDING_APPROVAL';

  const renderStatusBadge = () => {
    switch (rawStatus) {
      case 'ACTIVE':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/60">
            {t('vendors.details.statusActive', 'Active')}
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
            {t('vendors.details.statusPending', 'Pending Approval')}
          </span>
        );
      case 'DEACTIVATED':
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
            {t('vendors.details.statusDeactivated', 'Deactivated')}
          </span>
        );
      case 'REJECTED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-600 border border-red-100">
            {t('vendors.details.statusRejected', 'Rejected')}
          </span>
        );
    }
  };

  const renderMobileHeaderActions = () => {
    switch (rawStatus) {
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={openReject}
              className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 bg-white text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
            >
              {t('vendors.table.reject', 'Reject')}
            </button>
            <button
              type="button"
              onClick={openApprove}
              className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              {t('vendors.table.accept', 'Accept')}
            </button>
          </div>
        );

      case 'ACTIVE':
      case 'APPROVED':
        return (
          <button
            type="button"
            onClick={openSuspend}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 bg-white text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer text-center"
          >
            {t('vendors.details.suspend', 'Suspend')}
          </button>
        );

      case 'DEACTIVATED':
      case 'SUSPENDED':
        return (
          <button
            type="button"
            onClick={openActivate}
            className="w-full py-2.5 rounded-xl border border-green-200 text-green-700 bg-white text-xs font-semibold hover:bg-green-50 transition-colors cursor-pointer text-center"
          >
            {t('vendors.details.activate', 'Activate')}
          </button>
        );

      case 'REJECTED':
        return (
          <div className="w-full text-center py-2 px-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Mobile Top Vendor Card */}
      <div className="md:hidden bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base shrink-0 overflow-hidden">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 truncate">
                {vendor.businessName || '----'}
              </h1>
              {renderStatusBadge()}
            </div>
            <p className="text-xs text-gray-400 mb-1">{vendor.category || '----'}</p>
            {(vendor.joinedDate || vendor.submittedDate) && (
              <p className="text-[11px] text-gray-400">
                Joined {vendor.joinedDate || vendor.submittedDate || '----'}
              </p>
            )}
          </div>
        </div>
        {vendor.description && (
          <p className="text-xs text-gray-500 leading-relaxed mt-3 pt-3 border-t border-gray-100">
            {vendor.description}
          </p>
        )}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          {renderMobileHeaderActions()}
        </div>
      </div>

      {/* Desktop Vendor Header & Contact Info Card */}
      <Card className="hidden md:block p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-base shrink-0 overflow-hidden shadow-2xs">
            {vendor.logoUrl ? (
              <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-1">{renderStatusBadge()}</div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-1">
              {vendor.businessName || '----'}
            </h1>
            <p className="text-xs text-gray-400 mb-2">
              {vendor.category || '----'}
              {(vendor.joinedDate || vendor.submittedDate) && (
                <span> • Joined {vendor.joinedDate || vendor.submittedDate || '----'}</span>
              )}
            </p>
            {vendor.description && (
              <p className="text-xs text-gray-500 leading-relaxed max-w-4xl">
                {vendor.description}
              </p>
            )}
          </div>
        </div>

        {/* Contact Information Grid */}
        <div className="pt-6 border-t border-gray-100 mt-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">
            {t('vendors.details.contactInfo', 'Contact Information')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('vendors.details.owner', 'Owner')}</p>
              <p className="text-sm font-bold text-gray-900">{vendor.owner || '----'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('vendors.details.phone', 'Phone')}</p>
              <p className="text-sm font-bold text-gray-900">{vendor.phone || '----'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('vendors.details.email', 'Email')}</p>
              <p className="text-sm font-bold text-gray-900 break-all">{vendor.email || '----'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('vendors.details.location', 'Location')}</p>
              <p className="text-sm font-bold text-gray-900">{vendor.location || '----'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">{t('vendors.details.commercialRegister', 'Commercial Register')}</p>
              <p className="text-sm font-bold text-gray-900 font-mono">{vendor.taxId || '----'}</p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
