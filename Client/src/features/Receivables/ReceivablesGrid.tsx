import { TrendingUp, TrendingDown, Percent, Wallet, Clock } from 'lucide-react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  payoutSummary,
  type PayoutColor,
  type PayoutIconName,
  type PayoutSummary,
} from './constants';

type LucideIcon = ComponentType<{ size?: number; color?: string }>;

const ICONS: Record<PayoutIconName, LucideIcon> = {
  Chart: TrendingUp,
  Percent,
  Wallet,
  Clock,
};

const COLOR_THEME: Record<PayoutColor, { primary: string; light: string }> = {
  green: { primary: 'var(--green)', light: 'var(--green-light)' },
  orange: { primary: 'var(--orange)', light: 'var(--orange-light)' },
  blue: { primary: 'var(--blue, #3b82f6)', light: 'var(--blue-light)' },
  purple: {
    primary: 'var(--purple, #9333ea)',
    light: 'var(--purple-light, #faf5ff)',
  },
};

const isPositiveTrend = (trend: string) => trend.trim().startsWith('+');
const isNegativeTrend = (trend: string) => trend.trim().startsWith('-');

const ReceivablesGrid = () => {
  const { i18n } = useTranslation();
  const { isMobile, isTablet } = useBreakpoint();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="mb-6">
      <div
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {payoutSummary.map((item: PayoutSummary, index) => {
          const Icon = ICONS[item.icon];
          const theme = COLOR_THEME[item.color];
          const hasTrend = item.trend !== null;
          const positive = hasTrend && isPositiveTrend(item.trend as string);
          const negative = hasTrend && isNegativeTrend(item.trend as string);
          const trendColor = positive
            ? 'var(--green)'
            : negative
              ? 'var(--red)'
              : 'var(--gray-500, #6b7280)';
          const TrendIcon = positive ? TrendingUp : TrendingDown;
          const isLastSpanning =
            (isMobile || isTablet) &&
            index === payoutSummary.length - 1 &&
            payoutSummary.length % 2 !== 0;

          return (
            <div
              key={item.id}
              className={`bg-white border border-gray-100 rounded-xl p-3 lg:p-5 shadow-sm h-[130px] md:h-[145px] lg:h-[165px] flex flex-col justify-between animate-receivables-fade-in-up ${
                isLastSpanning ? 'col-span-2' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-lg shrink-0"
                  style={{ color: theme.primary }}
                >
                  <Icon size={18} color={theme.primary} />
                </span>
                <span
                  className="text-xs lg:text-sm font-medium leading-tight line-clamp-2"
                  style={{ color: theme.primary }}
                >
                  {item.title}
                </span>
              </div>

              {/* Value */}
              <div className="flex items-start flex-col gap-0.5">
                <div>
                  <span className="lg:text-xl xl:text-3xl text-xl font-bold text-gray-900">
                    {item.value}
                  </span>
                  {item.suffix && (
                    <span className="text-xs lg:text-sm text-gray-400 mb-1 mx-1.5">
                      {item.suffix}
                    </span>
                  )}
                </div>
                {/* Trend + label */}
                <div className="flex items-center gap-2 flex-wrap">
                  {hasTrend && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        color: trendColor,
                      }}
                    >
                      <TrendIcon size={12} color={trendColor} />
                      {item.trend}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {item.trendLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceivablesGrid;
