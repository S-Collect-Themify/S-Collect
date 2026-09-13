import { useTranslation } from 'react-i18next';
import { Megaphone, Eye, Calendar } from 'lucide-react';
import type { PushCampaign } from '../types';

interface MobileCampaignCardProps {
  campaign: PushCampaign;
  onViewDetails: (campaign: PushCampaign) => void;
}

export const MobileCampaignCard = ({
  campaign,
  onViewDetails,
}: MobileCampaignCardProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const total = campaign.totalTokens || 0;
  const success = campaign.successCount || 0;
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
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3.5">
      {/* Header Info */}
      <div className="flex items-start gap-3">
        {campaign.imageUrl ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
            <img
              src={campaign.imageUrl}
              alt={displayTitle || ''}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center shrink-0">
            <Megaphone size={20} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate">
            {displayTitle}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
            {displayBody}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
        <div>
          <span className="text-2xs text-gray-400 block font-medium">
            {t('campaigns.table.recipients', 'Targets')}
          </span>
          <span className="text-xs font-bold text-gray-800">{total}</span>
        </div>
        <div className="border-x border-gray-200">
          <span className="text-2xs text-emerald-600 block font-medium">
            {t('campaigns.table.delivered', 'Delivered')}
          </span>
          <span className="text-xs font-bold text-emerald-600">{success}</span>
        </div>
        <div>
          <span className="text-2xs text-gray-400 block font-medium">
            {t('campaigns.table.rate', 'Rate')}
          </span>
          <span className="text-xs font-bold text-gray-900">{rate}%</span>
        </div>
      </div>

      {/* Footer Date & View Action */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
        <span className="text-gray-400 flex items-center gap-1">
          <Calendar size={13} />
          {formattedDate}
        </span>
        <button
          type="button"
          onClick={() => onViewDetails(campaign)}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer"
        >
          <Eye size={13} />
          <span>{t('campaigns.actions.view', 'View')}</span>
        </button>
      </div>
    </div>
  );
};
