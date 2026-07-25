import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Box,
  PackageCheck,
  DollarSign,
  PackagePlus,
  ArrowDownLeft,
  ArrowDown,
} from 'lucide-react';
import type { ReportStatCardData } from '../types';

interface VendorReportStatCardsProps {
  cards: ReportStatCardData[];
}

export default function VendorReportStatCards({ cards }: VendorReportStatCardsProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const renderIcon = (iconName: ReportStatCardData['iconName']) => {
    switch (iconName) {
      case 'gmv':
        return <TrendingUp size={16} className="text-emerald-600 shrink-0" />;
      case 'commission':
        return <Box size={16} className="text-blue-600 shrink-0" />;
      case 'payouts':
        return <PackageCheck size={16} className="text-emerald-600 shrink-0" />;
      case 'net':
        return <DollarSign size={16} className="text-blue-600 shrink-0" />;
      case 'pending':
        return <PackagePlus size={16} className="text-amber-600 shrink-0" />;
      default:
        return null;
    }
  };

  const getTitleColor = (iconName: ReportStatCardData['iconName']) => {
    switch (iconName) {
      case 'gmv':
      case 'payouts':
        return 'text-emerald-600';
      case 'commission':
      case 'net':
        return 'text-blue-600';
      case 'pending':
        return 'text-amber-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4 mb-8">
      {cards.map((card) => {
        const titleColorClass = getTitleColor(card.iconName);
        const isLastCardOnMobile = card.id === 'pending';

        return (
          <div
            key={card.id}
            className={`bg-white rounded-2xl border border-gray-100 p-4 lg:p-5 shadow-2xs flex flex-col justify-between min-h-27.5 ${
              isLastCardOnMobile ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
            }`}
          >
            {/* Top Row: Icon + Title + Optional Badges */}
            <div className="flex items-center justify-between gap-1 mb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                {renderIcon(card.iconName)}
                <span className={`text-xs font-semibold truncate ${titleColorClass}`}>
                  {t(`vendorReports.${card.titleKey}`, card.defaultTitle)}
                </span>
              </div>

              {/* Commission Rate Badge */}
              {card.rateBadge && (
                <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                  {card.rateBadge}
                </span>
              )}

              {/* Amber Alert / Badge for Pending Payout */}
              {card.alertBadgeDefault && (
                <span className="bg-amber-50 text-amber-700 text-[10px] lg:text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                  {t(
                    `vendorReports.${card.alertBadgeKey || ''}`,
                    card.alertBadgeDefault
                  )}
                </span>
              )}
            </div>

            {/* Bottom Row: Value + Currency + Trend Indicator */}
            <div className="flex items-end justify-between flex-col sm:flex-row gap-2">
              <div className="flex items-baseline gap-1 w-full ">
                <span className="text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight ">
                  {card.value}
                </span>
                <span className="text-[11px] lg:text-xs font-medium text-gray-400">
                  {t('vendorReports.currency', card.currency)}
                </span>
              </div>

              {/* Trend Badge if present */}
              {card.trend && (
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 shrink-0">
                  {isRtl ? (
                    <ArrowDown className="w-3 h-3 text-emerald-700" />
                  ) : (
                    <ArrowDownLeft className="w-3 h-3 text-emerald-700" />
                  )}
                  {card.trend}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
