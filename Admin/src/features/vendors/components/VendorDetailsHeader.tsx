import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVendorDetailsStore } from '../store/useVendorDetailsStore';
import type { Vendor } from '../types/vendors';

interface VendorDetailsHeaderProps {
  vendor: Vendor;
}

export default function VendorDetailsHeader({ vendor }: VendorDetailsHeaderProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { openSuspend, openActivate, openReject, openApprove } = useVendorDetailsStore();

  const rawStatus = vendor.rawStatus
    ? String(vendor.rawStatus).toUpperCase()
    : vendor.active
    ? 'ACTIVE'
    : 'PENDING_APPROVAL';

  const renderHeaderActions = () => {
    switch (rawStatus) {
      case 'PENDING_APPROVAL':
      case 'PENDING':
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openReject}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
            >
              {t('vendors.table.reject', 'Reject')}
            </button>
            <button
              type="button"
              onClick={openApprove}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-600 bg-white text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-green-200 text-green-700 bg-white text-sm font-medium hover:bg-green-50 transition-colors cursor-pointer"
          >
            {t('vendors.details.activate', 'Activate')}
          </button>
        );

      case 'REJECTED':
        return (
          <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
            {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="sidebar-page-container-header border-b border-gray-100/80 flex justify-between items-center py-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-gray-900 heading-page-title">
          {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
        </h1>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/vendors" className="hover:text-gray-600 transition-colors">
            {t('vendors.details.breadcrumbParent', 'Vendor Management')}
          </Link>
          <ChevronRight size={12} className={`text-gray-400 shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="text-gray-900 font-medium">
            {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
          </span>
        </div>
      </div>

      {renderHeaderActions()}
    </div>
  );
}
