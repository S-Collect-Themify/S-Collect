import { useTranslation } from 'react-i18next';

export default function OrdersStatusDonut() {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          {t('dashboardOverview.ordersByStatus', 'Orders by Status')}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {t('dashboardOverview.totalOrders', 'Total Orders')}
        </p>
        <p className="text-xl font-bold text-gray-900">--</p>
      </div>

      {/* Center Donut SVG */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Ring Track */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#f1f5f9"
            strokeWidth="12"
            fill="transparent"
          />
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-extrabold text-gray-900 leading-none">--</span>
          <span className="text-[10px] font-medium text-gray-400 mt-0.5">
            {t('dashboardOverview.success', 'Success')}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-gray-600 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
          <span>{t('dashboardOverview.delivered', 'Delivered')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>{t('dashboardOverview.processing', 'Processing')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
          <span>{t('dashboardOverview.shipped', 'Shipped')}</span>
        </div>
      </div>
    </div>
  );
}
