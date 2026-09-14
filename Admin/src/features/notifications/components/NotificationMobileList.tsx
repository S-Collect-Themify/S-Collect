import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, Image as ImageIcon, UserCheck, Store } from 'lucide-react';
import type { PushCampaign } from '../../../services/pushCampaigns';
import { useVendors, useVendorDetails } from '../../vendors/hooks/useVendors';

interface NotificationMobileListProps {
  campaigns: PushCampaign[];
  isLoading?: boolean;
}

const BROKEN_IMAGE_FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='%23F9FAFB' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='18' height='18' x='3' y='3' rx='2'/><path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/><line x1='2' x2='22' y1='2' y2='22'/><circle cx='9' cy='9' r='2'/></svg>";

const VendorNameBadge: React.FC<{
  vendorId: string;
  vendorsMap: Record<string, any>;
  isLoadingVendors?: boolean;
}> = ({ vendorId, vendorsMap, isLoadingVendors }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const cachedVendor = vendorsMap[String(vendorId)];
  const { data: detailVendor, isLoading: isDetailLoading } = useVendorDetails(
    !cachedVendor ? vendorId : ''
  );

  const targetVendor = cachedVendor || detailVendor;
  const vAny = targetVendor as any;

  const displayName =
    (isAr && vAny?.storeNameAr ? vAny.storeNameAr : vAny?.storeName) ||
    (isAr && vAny?.store_name_ar ? vAny.store_name_ar : vAny?.store_name) ||
    (isAr && vAny?.nameAr ? vAny.nameAr : vAny?.name) ||
    (isAr && vAny?.name_ar ? vAny.name_ar : vAny?.name_en) ||
    (targetVendor?.businessName && targetVendor.businessName !== '--' ? targetVendor.businessName : null) ||
    (targetVendor?.owner && targetVendor.owner !== '--' ? targetVendor.owner : null) ||
    (vAny?.firstName ? `${vAny.firstName} ${vAny.lastName || ''}`.trim() : null) ||
    (vAny?.first_name ? `${vAny.first_name} ${vAny.last_name || ''}`.trim() : null) ||
    vendorId;

  const isLoading = (isLoadingVendors && !cachedVendor) || (isDetailLoading && !cachedVendor);

  if (isLoading && !targetVendor) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 animate-pulse">
        <Store size={12} className="text-purple-600" />
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
      <Store size={12} className="text-purple-600" />
      {displayName}
    </span>
  );
};

const MadeByBadge: React.FC<{
  item: PushCampaign;
  vendorsMap: Record<string, any>;
  isLoadingVendors?: boolean;
}> = ({ item, vendorsMap, isLoadingVendors }) => {
  const { t } = useTranslation();

  if (item.sentByVendorId) {
    return (
      <VendorNameBadge
        vendorId={item.sentByVendorId}
        vendorsMap={vendorsMap}
        isLoadingVendors={isLoadingVendors}
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
      <UserCheck size={12} className="text-gray-600" />
      {t('notificationsPage.madeByAdmin', 'Admin')}
    </span>
  );
};

export const NotificationMobileList: React.FC<NotificationMobileListProps> = ({
  campaigns,
  isLoading = false,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const { data: vendorsData, isLoading: isVendorsLoading } = useVendors({ pageSize: 200 });

  const vendorsMap = useMemo(() => {
    const map: Record<string, any> = {};
    const list = Array.isArray(vendorsData?.items)
      ? vendorsData.items
      : Array.isArray(vendorsData)
      ? vendorsData
      : [];
    list.forEach((v: any) => {
      if (v.id) map[String(v.id)] = v;
      if (v._id) map[String(v._id)] = v;
      if (v.vendorId) map[String(v.vendorId)] = v;
    });
    return map;
  }, [vendorsData]);

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '--';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse space-y-3"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center">
        <BellRing className="mx-auto h-10 w-10 text-gray-300 mb-2" />
        <p className="text-sm font-semibold text-gray-500">
          {t('notificationsPage.noCampaigns', 'No push campaigns found')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((item) => {
        const titleDisplay = isAr ? (item.titleAr || item.title) : (item.title || item.titleAr);
        const bodyDisplay = isAr ? (item.bodyAr || item.body) : (item.body || item.bodyAr);

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3"
            dir={isAr ? 'rtl' : 'ltr'}
          >
            {/* Header: Title + Image */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">{titleDisplay}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{bodyDisplay}</p>
              </div>

              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={titleDisplay}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = BROKEN_IMAGE_FALLBACK;
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon size={18} />
                </div>
              )}
            </div>

            {/* Footer row: Made By & Date */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-gray-100 text-xs">
              <div className="shrink-0">
                <MadeByBadge item={item} vendorsMap={vendorsMap} isLoadingVendors={isVendorsLoading} />
              </div>

              <div className="text-[11px] text-gray-400 font-medium shrink-0">
                {formatDate(item.createdAt)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};


