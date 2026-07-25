import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, Users } from 'lucide-react';
import type { PayoutStatCardData } from '../types';

interface PayoutStatCardItemProps {
  stat: PayoutStatCardData;
}

export default function PayoutStatCardItem({ stat }: PayoutStatCardItemProps) {
  const { t } = useTranslation();

  const renderIcon = (type: 'check' | 'clock' | 'users') => {
    switch (type) {
      case 'check':
        return <CheckCircle2 size={16} className="text-emerald-600 font-bold shrink-0" />;
      case 'clock':
        return <Clock size={16} className="text-amber-500 font-bold shrink-0" />;
      case 'users':
        return <Users size={16} className="text-blue-600 font-bold shrink-0" />;
    }
  };

  const renderBadge = (variant: 'emerald' | 'amber' | 'blue', text: string) => {
    switch (variant) {
      case 'emerald':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/50">
            {text}
          </span>
        );
      case 'amber':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-amber-50 text-amber-600 border border-amber-100/50">
            {text}
          </span>
        );
      case 'blue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-blue-50 text-blue-600 border border-blue-100/50">
            {text}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-2xs flex flex-col justify-between space-y-3">
      {/* Top Title & Icon */}
      <div className="flex items-center gap-1.5">
        {renderIcon(stat.iconType)}
        <span
          className={`text-xs font-semibold ${
            stat.iconType === 'check'
              ? 'text-emerald-600'
              : stat.iconType === 'clock'
              ? 'text-amber-500'
              : 'text-blue-600'
          }`}
        >
          {t(stat.titleKey, stat.defaultTitle)}
        </span>
      </div>

      {/* Value & Badge */}
      <div className="flex items-baseline justify-between gap-2 pt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            {stat.value}
          </span>
          <span className="text-xs text-gray-400 font-medium">{stat.unit}</span>
        </div>

        {renderBadge(stat.badgeVariant, t(stat.badgeTextKey, stat.defaultBadgeText))}
      </div>
    </div>
  );
}
