import { useTranslation } from 'react-i18next';
import {
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import type { PushCampaign, PushCampaignsPagination } from '../types';
import { getPaginationRange } from '../../../utils/pagination';

interface CampaignsTableProps {
  campaigns: PushCampaign[];
  pagination: PushCampaignsPagination;
  onPageChange: (page: number) => void;
  onViewDetails: (campaign: PushCampaign) => void;
}

export const CampaignsTable = ({
  campaigns,
  pagination,
  onPageChange,
  onViewDetails,
}: CampaignsTableProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const currentPage = pagination.currentPage || 1;
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  const pageSize = pagination.pageSize || 25;

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const tableHeaders = [
    t('campaigns.table.campaign', 'Campaign'),
    t('campaigns.table.recipients', 'Recipients'),
    t('campaigns.table.delivery', 'Delivery Status'),
    t('campaigns.table.successRate', 'Success Rate'),
    t('campaigns.table.date', 'Date Sent'),
    t('campaigns.table.actions', 'Actions'),
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-100">
              {tableHeaders.map((header, index) => (
                <th
                  key={header}
                  className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    index === tableHeaders.length - 1 ? 'text-end' : 'text-start'
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {campaigns.map((campaign) => {
              const total = campaign.totalTokens || 0;
              const success = campaign.successCount || 0;
              const failure = campaign.failureCount || 0;
              const rate = total > 0 ? Math.round((success / total) * 100) : 100;

              const displayTitle = isArabic
                ? campaign.titleAr || campaign.title
                : campaign.title || campaign.titleAr;

              const displayBody = isArabic
                ? campaign.bodyAr || campaign.body
                : campaign.body || campaign.bodyAr;

              const formattedDate = campaign.createdAt
                ? new Date(campaign.createdAt).toLocaleDateString(
                    isArabic ? 'ar-EG' : 'en-US',
                    {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )
                : '-';

              return (
                <tr
                  key={campaign.id}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  {/* Campaign Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5 max-w-sm">
                      {campaign.imageUrl ? (
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={campaign.imageUrl}
                            alt={displayTitle || ''}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display =
                                'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
                          <Megaphone size={19} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {displayTitle}
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {displayBody}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Recipients */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {total.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      {t('campaigns.table.devices', 'devices')}
                    </span>
                  </td>

                  {/* Delivery Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={13} />
                        <span>
                          {success.toLocaleString()}{' '}
                          {t('campaigns.table.delivered', 'delivered')}
                        </span>
                      </div>
                      {failure > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                          <AlertTriangle size={13} />
                          <span>
                            {failure.toLocaleString()}{' '}
                            {t('campaigns.table.failed', 'failed')}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Success Rate */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-gray-800">{rate}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            rate >= 90
                              ? 'bg-emerald-500'
                              : rate >= 70
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Date Sent */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-gray-400" />
                      <span>{formattedDate}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-end">
                    <button
                      type="button"
                      onClick={() => onViewDetails(campaign)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>{t('campaigns.actions.view', 'View')}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-gray-500 font-medium">
          {t('campaigns.pagination.showing', {
            start: rangeStart,
            end: rangeEnd,
            total: totalItems,
            defaultValue: `Showing ${rangeStart} - ${rangeEnd} of ${totalItems} campaigns`,
          })}
        </span>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              {isArabic ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {getPaginationRange(currentPage, totalPages).map((item, index) =>
              item === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium select-none"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(Number(item))}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                    item === currentPage
                      ? 'bg-gray-900 text-white font-bold'
                      : 'border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium'
                  }`}
                >
                  {item}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
            >
              {isArabic ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
