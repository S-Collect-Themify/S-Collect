import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { type ReturnItem } from '../types';

interface ReturnTimelineCardProps {
  item: ReturnItem;
}

export function ReturnTimelineCard({ item }: ReturnTimelineCardProps) {
  const { t } = useTranslation();

  const getTimelineTitle = (title: string) => {
    switch (title) {
      case 'Return Request Submitted':
        return t('returnsPage.timeline.requestSubmitted', {
          defaultValue: 'Return Request Submitted',
        });
      case 'Return Request Rejected':
        return t('returnsPage.timeline.requestRejected', {
          defaultValue: 'Return Request Rejected',
        });
      case 'Return Request Approved':
        return t('returnsPage.timeline.requestApproved', {
          defaultValue: 'Return Request Approved',
        });
      case 'Pending Vendor Review':
        return t('returnsPage.timeline.pendingVendorReview', {
          defaultValue: 'Pending Vendor Review',
        });
      case 'Refund Processing':
        return t('returnsPage.timeline.refundProcessing', {
          defaultValue: 'Refund Processing',
        });
      default:
        return title;
    }
  };

  const getTimelineSubtext = (subtext?: string) => {
    if (!subtext) return '';
    switch (subtext) {
      case 'Customer submitted a return request':
        return t('returnsPage.timeline.requestSubmittedSubtext', {
          defaultValue: 'Customer submitted a return request',
        });
      case 'Request rejected by vendor':
        return t('returnsPage.timeline.requestRejectedSubtext', {
          defaultValue: 'Request rejected by vendor',
        });
      case 'Vendor approved the request':
        return t('returnsPage.timeline.requestApprovedSubtext', {
          defaultValue: 'Vendor approved the request',
        });
      case 'Waiting for vendor review':
        return t('returnsPage.timeline.pendingVendorReviewSubtext', {
          defaultValue: 'Waiting for vendor review',
        });
      case 'Refund issued to customer':
        return t('returnsPage.timeline.refundCompletedSubtext', {
          defaultValue: 'Refund issued to customer',
        });
      case 'No refund processed':
        return t('returnsPage.timeline.noRefundProcessedSubtext', {
          defaultValue: 'No refund processed',
        });
      case 'Pending admin refund processing':
        return t('returnsPage.timeline.pendingAdminRefundSubtext', {
          defaultValue: 'Pending admin refund processing',
        });
      default:
        return subtext;
    }
  };

  const getTimelineDate = (date?: string) => {
    if (!date) return '';
    if (date === 'Recorded')
      return t('returnsPage.timeline.recorded', { defaultValue: 'Recorded' });
    if (date === 'Completed')
      return t('returnsPage.timeline.completed', {
        defaultValue: 'Completed',
      });
    return date;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {t('returnsPage.returnTimeline', { defaultValue: 'Return Timeline' })}
      </h2>
      <div className="space-y-5 relative before:absolute before:left-3.5 rtl:before:left-auto rtl:before:right-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {item.timeline?.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3.5 relative z-10">
            <div className="shrink-0 mt-0.5 bg-white rounded-full">
              {step.completed ? (
                <CheckCircle2
                  size={22}
                  className="text-emerald-600 fill-emerald-100"
                />
              ) : step.active ? (
                <Clock size={22} className="text-amber-500 fill-amber-50" />
              ) : (
                <Circle size={22} className="text-gray-300 fill-gray-50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs sm:text-sm font-bold ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}
                >
                  {getTimelineTitle(step.title)}
                </p>
                {step.date && (
                  <span className="text-xs text-gray-400">
                    {getTimelineDate(step.date)}
                  </span>
                )}
              </div>
              {step.subtext && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {getTimelineSubtext(step.subtext)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
