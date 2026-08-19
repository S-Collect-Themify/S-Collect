import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  useVendorDetails,
  useVendorProducts,
  useVendorPayouts,
  useVendorSubOrders,
} from '../features/vendors/hooks/useVendors';
import {
  type MockOrder,
} from '../features/vendors/data/constant';
import { containerVariants } from '../features/vendors/components/VendorDetailsCards';
import VendorDetailsHeader from '../features/vendors/components/VendorDetailsHeader';
import VendorOverviewCard from '../features/vendors/components/VendorOverviewCard';
import VendorStatsGrid from '../features/vendors/components/VendorStatsGrid';
import VendorRecentOrdersTable from '../features/vendors/components/VendorRecentOrdersTable';
import VendorRecentProductsTable from '../features/vendors/components/VendorRecentProductsTable';
import VendorPayoutsLogTable from '../features/vendors/components/VendorPayoutsLogTable';
import VendorDetailsModals from '../features/vendors/components/VendorDetailsModals';

export default function VendorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const ORDER_STATUS_STYLES: Record<string, { label: string; className: string }> = useMemo(
    () => ({
      active: { label: t('vendors.details.statusActive', 'Active'), className: 'bg-emerald-50 text-emerald-600' },
      completed: { label: t('vendors.details.statusCompleted', 'Completed'), className: 'bg-blue-50 text-blue-700' },
      pending: { label: t('vendors.details.statusPending', 'Pending'), className: 'bg-amber-50 text-amber-700' },
      cancelled: { label: t('vendors.details.statusCancelled', 'Cancelled'), className: 'bg-red-50 text-red-600' },
    }),
    [t]
  );

  const PAYOUT_STATUS_STYLES: Record<string, { label: string; className: string }> = useMemo(
    () => ({
      completed: { label: t('vendors.details.statusCompleted', 'Completed'), className: 'bg-emerald-50 text-emerald-600' },
      accepted: { label: t('vendors.details.statusAccepted', 'Accepted'), className: 'bg-green-50 text-green-700' },
      pending: { label: t('vendors.details.statusPending', 'Pending'), className: 'bg-amber-50 text-amber-700' },
      rejected: { label: t('vendors.details.statusRejected', 'Rejected'), className: 'bg-red-50 text-red-600' },
    }),
    [t]
  );

  const vendorId = id ?? '';
  const { data: vendor, isLoading, isError } = useVendorDetails(vendorId);
  const { data: apiProductsData } = useVendorProducts(vendorId, 1, 5);
  const { data: apiPayoutsData } = useVendorPayouts(vendorId, 1, 5);
  const { data: apiSubOrdersData } = useVendorSubOrders(vendorId, 1, 5);

  const orders = useMemo(() => {
    const rawData = apiSubOrdersData as any;
    const rawItems: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.data?.items)
      ? rawData.data.items
      : [];

    if (rawItems.length > 0) {
      return rawItems.map((item: any) => {
        const idStr = item.id ? String(item.id) : item.orderId ? String(item.orderId) : '--';
        const formattedId = idStr.startsWith('#') ? idStr : `#ORD-${idStr.slice(-6).toUpperCase()}`;

        const dateStr = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '--';

        const customerName = item.customer
          ? [item.customer.firstName, item.customer.lastName].filter(Boolean).join(' ').trim() || '--'
          : '--';

        const statusLower = item.status ? String(item.status).toLowerCase() : 'pending';
        const statusMapped =
          statusLower === 'delivered' || statusLower === 'shipped'
            ? 'completed'
            : statusLower === 'processing'
            ? 'active'
            : statusLower === 'cancelled'
            ? 'cancelled'
            : 'pending';

        const priceNum = typeof item.totalAmount === 'number'
          ? item.totalAmount
          : typeof item.totalAmount === 'string'
          ? parseFloat(item.totalAmount) || 0
          : 0;

        return {
          id: formattedId,
          submittedDate: dateStr,
          customerName,
          status: statusMapped as 'active' | 'completed' | 'pending' | 'cancelled',
          price: priceNum,
        };
      });
    }

    return [] as MockOrder[];
  }, [apiSubOrdersData]);
  
  const products = useMemo(() => {
    const rawData = apiProductsData as any;
    const rawItems: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.data?.items)
      ? rawData.data.items
      : [];

    if (rawItems.length > 0) {
      return rawItems.map((item: any) => {
        const prodName = isRtl && (item.nameAr || item.name_ar) ? (item.nameAr || item.name_ar) : item.name || item.title || '--';
        const catObj = typeof item.category === 'object' && item.category !== null ? item.category : null;
        const catName = isRtl && (catObj?.nameAr || catObj?.name_ar || item.categoryAr || item.category_ar)
          ? (catObj?.nameAr || catObj?.name_ar || item.categoryAr || item.category_ar)
          : (catObj?.name || (typeof item.category === 'string' ? item.category : '--'));

        return {
          id: (item.id || '') as string,
          name: prodName as string,
          category: catName as string,
          price: (typeof item.minPrice === 'number'
            ? item.minPrice
            : typeof item.price === 'number'
            ? item.price
            : typeof item.minPrice?.amount === 'number'
            ? item.minPrice.amount
            : 0) as number,
          status: (item.isActive && !item.isDisabled ? 'active' : 'inactive') as 'active' | 'inactive',
        };
      });
    }
    return [] as Array<{
      id?: string;
      name: string;
      category: string;
      price: number;
      status: string;
    }>;
  }, [apiProductsData, isRtl]);

  const payouts = useMemo(() => {
    const rawData = apiPayoutsData as any;
    const rawItems: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.data)
      ? rawData.data
      : Array.isArray(rawData?.data?.items)
      ? rawData.data.items
      : [];

    if (rawItems.length > 0) {
      return rawItems.map((item: any) => {
        const idStr = item.id ? String(item.id) : '--';
        const formattedId = idStr.startsWith('#') ? idStr : `#PAY-${idStr.slice(-6).toUpperCase()}`;
        const dateStr = item.transferDate
          ? new Date(item.transferDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '--';

        const amountNum = typeof item.amount === 'number'
          ? item.amount
          : typeof item.amount === 'string'
          ? parseFloat(item.amount) || 0
          : 0;

        return {
          id: formattedId,
          date: dateStr,
          amount: amountNum,
          status: item.status ? String(item.status).toLowerCase() : 'completed',
        };
      });
    }

    return [] as Array<{
      id: string;
      date: string;
      amount: number;
      status: string;
    }>;
  }, [apiPayoutsData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">{t('vendors.details.loading', 'Loading vendor details...')}</p>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-40 text-center">
        <p className="text-gray-500 text-sm">{t('vendors.details.vendorNotFound', 'Vendor not found')}</p>
        <button
          onClick={() => navigate('/vendors')}
          className="text-sm underline text-gray-600 cursor-pointer"
        >
          {t('vendors.details.backToVendors', 'Back to Vendors')}
        </button>
      </div>
    );
  }

  const rawStatus = vendor.rawStatus
    ? String(vendor.rawStatus).toUpperCase()
    : vendor.active
    ? 'ACTIVE'
    : 'PENDING_APPROVAL';

  const isRejected = rawStatus === 'REJECTED';

  return (
    <>
      <VendorDetailsHeader vendor={vendor} />

      <motion.div
        className="sidebar-page-container py-6 md:py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {isRejected && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
            <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="text-sm font-bold text-red-800">
                {t('vendors.details.rejectedNotice', 'Vendor is rejected')}
              </h3>
              {vendor.rejectionReason && (
                <p className="text-xs text-red-700 mt-1">
                  <span className="font-semibold">{t('vendors.details.reason', 'Reason')}: </span>
                  {vendor.rejectionReason}
                </p>
              )}
            </div>
          </div>
        )}

        <VendorOverviewCard vendor={vendor} />
        <VendorStatsGrid vendor={vendor} vendorId={vendorId} />
        <VendorRecentOrdersTable
          vendorId={vendorId}
          vendorName={vendor.businessName || vendor.owner}
          orders={orders}
          statusStyles={ORDER_STATUS_STYLES}
        />
        <VendorRecentProductsTable
          vendorId={vendorId}
          vendorName={vendor.businessName || vendor.owner}
          products={products}
        />
        <VendorPayoutsLogTable vendorId={vendorId} payouts={payouts} statusStyles={PAYOUT_STATUS_STYLES} />
      </motion.div>

      <VendorDetailsModals vendorId={vendorId} vendorName={vendor.businessName} />
    </>
  );
}
