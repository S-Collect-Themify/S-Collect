import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, Image as ImageIcon, UserCheck, Store } from 'lucide-react';
import type { PushCampaign } from '../../../services/pushCampaigns';
import { useVendors, useVendorDetails } from '../../vendors/hooks/useVendors';

interface NotificationTableProps {
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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 animate-pulse">
        <Store size={13} className="text-purple-600" />
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60">
      <Store size={13} className="text-purple-600" />
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
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
      <UserCheck size={13} className="text-gray-600" />
      {t('notificationsPage.madeByAdmin', 'Admin')}
    </span>
  );
};

export const NotificationTable: React.FC<NotificationTableProps> = ({
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-4 px-4 text-start">{t('notificationsPage.tableTitle', 'Campaign Title')}</th>
              <th className="py-4 px-4 text-start">{t('notificationsPage.tableMessage', 'Message Content')}</th>
              <th className="py-4 px-4 text-start">{t('notificationsPage.tableImage', 'Image')}</th>
              <th className="py-4 px-4 text-start">{t('notificationsPage.tableMadeBy', 'Created By')}</th>
              <th className="py-4 px-4 text-start">{t('notificationsPage.tableDate', 'Sent Date')}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="animate-pulse">
                  {/* Campaign Title */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded-md w-36" />
                  </td>
                  {/* Message Content */}
                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <div className="h-3.5 bg-gray-200 rounded-md w-56" />
                      <div className="h-3 bg-gray-100 rounded-md w-36" />
                    </div>
                  </td>
                  {/* Image */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  </td>
                  {/* Created By */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-24" />
                  </td>
                  {/* Sent Date */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="h-3.5 bg-gray-200 rounded-md w-28" />
                  </td>
                </tr>
              ))
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                      <BellRing size={22} />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">
                      {t('notificationsPage.noCampaigns', 'No push campaigns found')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns.map((item) => {
                const titleDisplay = isAr ? (item.titleAr || item.title) : (item.title || item.titleAr);
                const bodyDisplay = isAr ? (item.bodyAr || item.body) : (item.body || item.bodyAr);

                return (
                  <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                    {/* Title */}
                    <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap min-w-44" dir={isAr ? 'rtl' : 'ltr'}>
                      <span className="font-semibold text-gray-900 text-sm">{titleDisplay}</span>
                    </td>

                    {/* Body */}
                    <td className="py-4 px-4 text-gray-700 min-w-64 max-w-xs" dir={isAr ? 'rtl' : 'ltr'}>
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-700">{bodyDisplay}</p>
                    </td>

                    {/* Image */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={titleDisplay}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = BROKEN_IMAGE_FALLBACK;
                          }}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200/60 flex items-center justify-center text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>

                    {/* Made By */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <MadeByBadge item={item} vendorsMap={vendorsMap} isLoadingVendors={isVendorsLoading} />
                    </td>

                    {/* Sent Date */}
                    <td className="py-4 px-4 text-gray-500 text-xs whitespace-nowrap font-medium">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


