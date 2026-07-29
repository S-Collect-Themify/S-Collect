import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Vendor } from '../types/vendors';

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface VendorHeaderProps {
  vendor?: Vendor;
  onSuspend: () => void;
  onActivate: () => void;
  activeSubTab?: 'overview' | 'products' | 'orders' | 'payouts';
}

export default function VendorHeader({
  vendor,
  onSuspend,
  onActivate,
  activeSubTab = 'overview',
}: VendorHeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  if (!vendor) return null;

  const isSuspended = !vendor.active;

  return (
    <>
      {/* Header Breadcrumbs */}
      <div className="sidebar-page-container-header border-b border-gray-100/80 flex justify-between items-center py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title mb-1">
              {t('vendors.title', 'Vendor Management')}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
              <span
                onClick={() => navigate('/vendors')}
                className="hover:underline cursor-pointer text-gray-500 font-medium"
              >
                {t('vendors.title', 'Vendor Management')}
              </span>
              <ChevronRight size={12} className={isRtl ? 'rotate-180 text-gray-300' : 'text-gray-300'} />
              <span
                onClick={() => navigate(`/vendors/${vendor.id}`)}
                className="hover:underline cursor-pointer text-gray-500 font-medium"
              >
                {t('vendors.details.breadcrumbCurrent', 'Vendor Details')}
              </span>
              {activeSubTab === 'payouts' && (
                <>
                  <ChevronRight size={12} className={isRtl ? 'rotate-180 text-gray-300' : 'text-gray-300'} />
                  <span className="text-gray-900 font-semibold">{t('vendors.details.payoutsLog', 'Payouts Log')}</span>
                </>
              )}
              {activeSubTab === 'orders' && (
                <>
                  <ChevronRight size={12} className={isRtl ? 'rotate-180 text-gray-300' : 'text-gray-300'} />
                  <span className="text-gray-900 font-semibold">{t('vendors.details.ordersLog', 'Orders Log')}</span>
                </>
              )}
              {activeSubTab === 'products' && (
                <>
                  <ChevronRight size={12} className={isRtl ? 'rotate-180 text-gray-300' : 'text-gray-300'} />
                  <span className="text-gray-900 font-semibold">{t('vendors.details.products', 'Products')}</span>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            {isSuspended ? (
              <button
                onClick={onActivate}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {t('vendors.details.activateVendor', 'Activate Vendor')}
              </button>
            ) : (
              <button
                onClick={onSuspend}
                className="px-4 py-2 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                {t('vendors.details.suspendVendor', 'Suspend Vendor')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Profile Top Banner Card */}
      <div className="sidebar-page-container py-6 md:py-8 space-y-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-800 border border-gray-200/80 flex items-center justify-center text-base font-bold shrink-0">
                {getInitials(vendor.businessName)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{vendor.businessName}</h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isSuspended
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isSuspended
                      ? t('vendors.details.suspended', 'Suspended')
                      : t('vendors.details.active', 'Active')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  {vendor.category || 'Apparel & Fashion'} • {t('vendors.details.joined', 'Joined')} {vendor.submittedDate || 'Oct 12, 2023'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
