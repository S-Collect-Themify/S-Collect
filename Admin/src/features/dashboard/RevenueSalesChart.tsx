import { useState, useMemo, useEffect } from 'react';
import RevenueSalesChartHeader from './components/RevenueSalesChartHeader';
import RevenueSalesChartArea from './components/RevenueSalesChartArea';
import type { ChartConfig } from '../../components/ui/chart';
import { useRevenueOverviewSales, getDateFromToParams } from './hooks/useRevenueOverview';

const chartConfig = {
  sales: {
    label: 'Sales',
    color: '#22c55e',
  },
} satisfies ChartConfig;

interface RevenueSalesChartProps {
  dateFrom?: string;
  dateTo?: string;
}

export default function RevenueSalesChart({
  dateFrom: parentDateFrom,
  dateTo: parentDateTo,
}: RevenueSalesChartProps) {
  const [dateRangeKey, setDateRangeKey] = useState('last30Days');
  const [customRange, setCustomRange] = useState<{ dateFrom: string; dateTo: string }>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      dateFrom: parentDateFrom || thirtyDaysAgo.toISOString().split('T')[0],
      dateTo: parentDateTo || now.toISOString().split('T')[0],
    };
  });

  // If parent dates change, update customRange to reflect parent if desired
  useEffect(() => {
    if (parentDateFrom && parentDateTo) {
      setCustomRange({ dateFrom: parentDateFrom, dateTo: parentDateTo });
    }
  }, [parentDateFrom, parentDateTo]);

  const { dateFrom, dateTo } = useMemo(
    () => getDateFromToParams(dateRangeKey, customRange),
    [dateRangeKey, customRange]
  );

  const groupBy = useMemo(() => {
    const diffDays =
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 7) return 'day';
    if (diffDays <= 35) return 'day';
    if (diffDays <= 90) return 'week';
    return 'month';
  }, [dateFrom, dateTo]);

  const { data: salesData, isLoading } = useRevenueOverviewSales({
    dateFrom,
    dateTo,
    groupBy,
  });

  const chartData = (salesData?.points || []).map((pt) => ({
    label: pt.label || pt.periodStart || '',
    sales: typeof pt.value === 'number' ? pt.value : 0,
  }));

  const totalVal = salesData?.total ?? 0;
  const totalDisplay =
    salesData !== undefined
      ? totalVal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
      : isLoading
      ? '...'
      : '0';

  const handleSelectPreset = (key: string) => {
    setDateRangeKey(key);
  };

  const handleApplyCustom = (from: string, to: string) => {
    setCustomRange({ dateFrom: from, dateTo: to });
    setDateRangeKey('custom');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Component 1: Header + Filter Dropdown */}
      <RevenueSalesChartHeader
        totalDisplay={totalDisplay}
        dateRangeKey={dateRangeKey}
        customFrom={customRange.dateFrom}
        customTo={customRange.dateTo}
        onSelectPreset={handleSelectPreset}
        onApplyCustom={handleApplyCustom}
      />

      {/* Component 2: Recharts Area Renderer */}
      <RevenueSalesChartArea data={chartData} config={chartConfig} />
    </div>
  );
}
