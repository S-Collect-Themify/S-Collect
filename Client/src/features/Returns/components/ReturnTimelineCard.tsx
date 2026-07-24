import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { type ReturnItem } from '../types';

interface ReturnTimelineCardProps {
  item: ReturnItem;
}

export function ReturnTimelineCard({ item }: ReturnTimelineCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
      <h2 className="text-base font-bold text-gray-900 mb-4">
        {t('returnsPage.returnTimeline', { defaultValue: 'Return Timeline' })}
      </h2>
      <div className="space-y-5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {item.timeline?.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3.5 relative z-10">
            <div className="shrink-0 mt-0.5 bg-white rounded-full">
              {step.completed ? (
                <CheckCircle2 size={22} className="text-emerald-600 fill-emerald-100" />
              ) : step.active ? (
                <Clock size={22} className="text-amber-500 fill-amber-50" />
              ) : (
                <Circle size={22} className="text-gray-300 fill-gray-50" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className={`text-xs sm:text-sm font-bold ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                {step.date && <span className="text-xs text-gray-400">{step.date}</span>}
              </div>
              {step.subtext && (
                <p className="text-xs text-gray-500 mt-0.5">{step.subtext}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
