import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePayoutBalance } from './usePayouts';

const COLOR_THEME = {
  green: { primary: 'var(--green, #10b981)', bg: 'bg-emerald-50 text-emerald-600' },
  orange: { primary: 'var(--orange, #f59e0b)', bg: 'bg-amber-50 text-amber-600' },
  blue: { primary: 'var(--blue, #3b82f6)', bg: 'bg-blue-50 text-blue-600' },
};

const ReceivablesGrid = () => {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { data: balance, isLoading } = usePayoutBalance();

  const metrics = [
    {
      id: 1,
      title: t('receivables.eligibleEarnings', {
        defaultValue: 'Eligible Earnings',
      }),
      value: isLoading
        ? null
        : (balance?.eligibleEarnings ?? 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      suffix: t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' }),
      icon: TrendingUp,
      theme: COLOR_THEME.green,
    },
    {
      id: 2,
      title: t('receivables.pendingBalance', {
        defaultValue: 'Pending Balance',
      }),
      value: isLoading
        ? null
        : (balance?.pendingBalance ?? 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      suffix: t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' }),
      icon: Clock,
      theme: COLOR_THEME.orange,
    },
    {
      id: 3,
      title: t('receivables.totalPaidOut', {
        defaultValue: 'Total Paid Out',
      }),
      value: isLoading
        ? null
        : (balance?.totalPaidOut ?? 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
      suffix: t('dashboardMetrics.unit.sar', { defaultValue: 'SAR' }),
      icon: CheckCircle2,
      theme: COLOR_THEME.blue,
    },
  ];

  return (
    <div className="mb-6">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xl:gap-6"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {metrics.map((item, index) => {
          const Icon = item.icon;
          const theme = item.theme;

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs h-[140px] lg:h-[155px] flex flex-col justify-between transition-all hover:shadow-md hover:border-gray-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${theme.bg}`}
                >
                  <Icon size={20} />
                </span>
                <span className="text-sm font-semibold text-gray-700 leading-tight">
                  {item.title}
                </span>
              </div>

              {/* Value */}
              <div className="flex items-baseline gap-1.5 mt-2">
                {isLoading ? (
                  <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse" />
                ) : (
                  <>
                    <span className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
                      {item.value}
                    </span>
                    {item.suffix && (
                      <span className="text-xs lg:text-sm font-medium text-gray-400">
                        {item.suffix}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReceivablesGrid;
