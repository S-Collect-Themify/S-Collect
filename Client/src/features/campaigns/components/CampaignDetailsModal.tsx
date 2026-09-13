import { useTranslation } from 'react-i18next';
import { X, Megaphone, CheckCircle2, AlertTriangle, Users, Calendar } from 'lucide-react';
import type { PushCampaign } from '../types';

interface CampaignDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: PushCampaign | null;
}

export const CampaignDetailsModal = ({
  isOpen,
  onClose,
  campaign,
}: CampaignDetailsModalProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  if (!isOpen || !campaign) return null;

  const total = campaign.totalTokens || 0;
  const success = campaign.successCount || 0;
  const failure = campaign.failureCount || 0;
  const rate = total > 0 ? Math.round((success / total) * 100) : 100;

  const formattedDate = campaign.createdAt
    ? new Date(campaign.createdAt).toLocaleString(
        isArabic ? 'ar-EG' : 'en-US',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      )
    : '-';

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-6 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gray-100 text-gray-900">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {t('campaigns.details.title', 'Campaign Details')}
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                {campaign.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Banner Image Preview if present */}
          {campaign.imageUrl && (
            <div className="w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 relative aspect-[16/9] sm:aspect-[2/1] min-h-[200px]">
              <img
                src={campaign.imageUrl}
                alt={campaign.title || 'Notification image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Delivery Statistics Grid */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-gray-50/80 border border-gray-200/70">
            <div className="text-center">
              <span className="flex items-center justify-center text-gray-500 gap-1 text-xs font-semibold mb-1">
                <Users size={14} />
                {t('campaigns.details.totalRecipients', 'Total Targets')}
              </span>
              <p className="text-lg font-bold text-gray-900">{total}</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <span className="flex items-center justify-center text-emerald-600 gap-1 text-xs font-semibold mb-1">
                <CheckCircle2 size={14} />
                {t('campaigns.details.delivered', 'Delivered')}
              </span>
              <p className="text-lg font-bold text-emerald-600">{success}</p>
            </div>
            <div className="text-center">
              <span className="flex items-center justify-center text-red-500 gap-1 text-xs font-semibold mb-1">
                <AlertTriangle size={14} />
                {t('campaigns.details.failed', 'Failed')}
              </span>
              <p className="text-lg font-bold text-red-600">{failure}</p>
            </div>
          </div>

          {/* Delivery Rate Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-gray-600 mb-1.5">
              <span>{t('campaigns.details.successRate', 'Delivery Success Rate')}</span>
              <span className="font-bold text-gray-900">{rate}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
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

          {/* Content: English Version */}
          <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1.5" dir="ltr">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>English Notification</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900">{campaign.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{campaign.body}</p>
          </div>

          {/* Content: Arabic Version */}
          {(campaign.titleAr || campaign.bodyAr) && (
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-1.5" dir="rtl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <span>الإشعار باللغة العربية</span>
              </div>
              <h3 className="text-sm font-bold text-gray-900">{campaign.titleAr}</h3>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{campaign.bodyAr}</p>
            </div>
          )}

          {/* Date & Metadata */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gray-400" />
              {formattedDate}
            </span>
            {campaign.sentByVendorId && (
              <span className="text-gray-400">
                {t('campaigns.details.sentByVendor', 'Sent by store')}
              </span>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
