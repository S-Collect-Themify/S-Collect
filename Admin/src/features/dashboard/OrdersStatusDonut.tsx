import { useTranslation } from 'react-i18next';
import { useRevenueOverviewOrdersSummary } from './hooks/useRevenueOverview';

interface OrdersStatusDonutProps {
  dateFrom: string;
  dateTo: string;
}

export default function OrdersStatusDonut({ dateFrom, dateTo }: OrdersStatusDonutProps) {
  const { t } = useTranslation();
  const { data, isLoading } = useRevenueOverviewOrdersSummary({ dateFrom, dateTo });

  const totalOrders = data?.totalOrders ?? 0;
  const delivered = data?.byStatus?.delivered ?? 0;
  const processing = data?.byStatus?.processing ?? 0;
  const shipped = data?.byStatus?.shipped ?? 0;

  // Format success rate percent
  let successDisplay = '--';
  if (data?.successRatePercent !== undefined && data.successRatePercent !== null) {
    if (typeof data.successRatePercent === 'number') {
      successDisplay = `${Math.round(data.successRatePercent)}%`;
    } else if (typeof data.successRatePercent === 'string') {
      successDisplay = data.successRatePercent.endsWith('%')
        ? data.successRatePercent
        : `${data.successRatePercent}%`;
    }
  } else if (totalOrders > 0 && data?.successCount !== undefined) {
    const rate = Math.round((data.successCount / totalOrders) * 100);
    successDisplay = `${rate}%`;
  }

  // Donut SVG Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const totalCount = totalOrders > 0 ? totalOrders : 1;

  const deliveredDash = (delivered / totalCount) * circumference;
  const processingDash = (processing / totalCount) * circumference;
  const shippedDash = (shipped / totalCount) * circumference;

  const deliveredOffset = 0;
  const processingOffset = -deliveredDash;
  const shippedOffset = -(deliveredDash + processingDash);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          {t('dashboardOverview.ordersByStatus', 'Orders by Status')}
        </h2>
        <p className="text-xs text-gray-500 font-medium">
          {t('dashboardOverview.totalOrders', 'Total Orders')}
        </p>
        <p className="text-xl font-bold text-gray-900">
          {isLoading ? '...' : totalOrders.toLocaleString()}
        </p>
      </div>

      {/* Center Donut SVG */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f1f5f9"
            strokeWidth="12"
            fill="transparent"
          />

          {/* Delivered (Green) */}
          {delivered > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#22c55e"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${deliveredDash} ${circumference}`}
              strokeDashoffset={deliveredOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Processing (Amber) */}
          {processing > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#f59e0b"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${processingDash} ${circumference}`}
              strokeDashoffset={processingOffset}
              className="transition-all duration-500"
            />
          )}

          {/* Shipped (Blue) */}
          {shipped > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#3b82f6"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={`${shippedDash} ${circumference}`}
              strokeDashoffset={shippedOffset}
              className="transition-all duration-500"
            />
          )}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-extrabold text-gray-900 leading-none">
            {isLoading ? '...' : successDisplay}
          </span>
          <span className="text-[10px] font-medium text-gray-500 mt-0.5">
            {t('dashboardOverview.success', 'Success')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-gray-600 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span>
            {t('dashboardOverview.delivered', 'Delivered')}{' '}
            <strong className="text-gray-900 font-semibold">({delivered})</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>
            {t('dashboardOverview.processing', 'Processing')}{' '}
            <strong className="text-gray-900 font-semibold">({processing})</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
          <span>
            {t('dashboardOverview.shipped', 'Shipped')}{' '}
            <strong className="text-gray-900 font-semibold">({shipped})</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
