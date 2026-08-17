import { useState } from 'react';
import RevenueSalesChartHeader, {
  type PeriodKey,
  type PeriodOption,
} from './components/RevenueSalesChartHeader';
import RevenueSalesChartArea from './components/RevenueSalesChartArea';
import type { ChartConfig } from '../../components/ui/chart';
import { useRevenueOverviewSales } from './hooks/useRevenueOverview';

const periods: PeriodOption[] = [
  { key: 'monthly', defaultLabel: 'Monthly' },
  { key: 'weekly', defaultLabel: 'Weekly' },
  { key: 'daily', defaultLabel: 'Daily' },
];

const periodToGroupBy: Record<PeriodKey, 'day' | 'week' | 'month'> = {
  monthly: 'month',
  weekly: 'week',
  daily: 'day',
};

const chartConfig = {
  sales: {
    label: 'Sales',
    color: '#22c55e',
  },
} satisfies ChartConfig;

interface RevenueSalesChartProps {
  dateFrom: string;
  dateTo: string;
}

export default function RevenueSalesChart({ dateFrom, dateTo }: RevenueSalesChartProps) {
  const [periodKey, setPeriodKey] = useState<PeriodKey>('monthly');

  const groupBy = periodToGroupBy[periodKey] || 'month';

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

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col justify-between h-full">
      {/* Component 1: Header + Filter Dropdown */}
      <RevenueSalesChartHeader
        periodKey={periodKey}
        periods={periods}
        totalDisplay={totalDisplay}
        onPeriodChange={setPeriodKey}
      />

      {/* Component 2: Recharts Area Renderer */}
      <RevenueSalesChartArea data={chartData} config={chartConfig} />
    </div>
  );
}
