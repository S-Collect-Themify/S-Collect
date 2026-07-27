import { Link, useNavigate } from 'react-router-dom';
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
      <div className="sidebar-page-container-header bg-white border-b border-gray-100 py-4 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span
            onClick={() => navigate('/vendors')}
            className="hover:underline cursor-pointer text-gray-500 font-medium"
          >
            {t('vendors.title', 'Vendors')}
          </span>
          <ChevronRight size={12} className={isRtl ? 'rotate-180' : ''} />
          <span className="text-gray-900 font-semibold">{vendor.businessName}</span>
        </div>
      </div>

      {/* Vendor Profile Top Banner Card */}
      <div className="sidebar-page-container mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-lg font-bold shadow-md shrink-0">
                {getInitials(vendor.businessName)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{vendor.businessName}</h1>
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
                <p className="text-xs text-gray-400 mt-1">
                  {t('vendors.details.owner', 'Owner')}: {vendor.owner} • {vendor.category}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isSuspended ? (
                <button
                  onClick={onActivate}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {t('vendors.details.activateVendor', 'Activate Vendor')}
                </button>
              ) : (
                <button
                  onClick={onSuspend}
                  className="px-4 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  {t('vendors.details.suspendVendor', 'Suspend Vendor')}
                </button>
              )}
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-t border-gray-100 mt-6 pt-4 text-xs font-semibold">
            <Link
              to={`/vendors/${vendor.id}`}
              className={`pb-1 transition-colors ${
                activeSubTab === 'overview'
                  ? 'text-gray-900 border-b-2 border-gray-900 font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('vendors.details.overview', 'Overview')}
            </Link>
            <Link
              to={`/vendors/${vendor.id}/products`}
              className={`pb-1 transition-colors ${
                activeSubTab === 'products'
                  ? 'text-gray-900 border-b-2 border-gray-900 font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('vendors.details.products', 'Products')}
            </Link>
            <Link
              to={`/vendors/${vendor.id}/orders`}
              className={`pb-1 transition-colors ${
                activeSubTab === 'orders'
                  ? 'text-gray-900 border-b-2 border-gray-900 font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('vendors.details.orders', 'Orders')}
            </Link>
            <Link
              to={`/vendors/${vendor.id}/payouts`}
              className={`pb-1 transition-colors ${
                activeSubTab === 'payouts'
                  ? 'text-gray-900 border-b-2 border-gray-900 font-bold'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t('vendors.details.payouts', 'Payouts')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
