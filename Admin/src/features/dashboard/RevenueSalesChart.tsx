import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import RevenueSalesChartHeader, {
  type PeriodKey,
  type PeriodOption,
} from './components/RevenueSalesChartHeader';
import RevenueSalesChartArea from './components/RevenueSalesChartArea';
import type { ChartConfig } from '../../components/ui/chart';

const periods: PeriodOption[] = [
  { key: 'monthly', defaultLabel: 'Monthly' },
  { key: 'weekly', defaultLabel: 'Weekly' },
  { key: 'yearly', defaultLabel: 'Yearly' },
];

const dataByPeriod: Record<
  PeriodKey,
  { labelKey: string; defaultLabel: string; sales: number }[]
> = {
  monthly: [
    { labelKey: 'Jan', defaultLabel: 'Jan', sales: 0 },
    { labelKey: 'Feb', defaultLabel: 'Feb', sales: 0 },
    { labelKey: 'Mar', defaultLabel: 'Mar', sales: 0 },
    { labelKey: 'Apr', defaultLabel: 'Apr', sales: 0 },
    { labelKey: 'May', defaultLabel: 'May', sales: 0 },
    { labelKey: 'Jun', defaultLabel: 'Jun', sales: 0 },
    { labelKey: 'Jul', defaultLabel: 'Jul', sales: 0 },
  ],
  weekly: [
    { labelKey: 'Mon', defaultLabel: 'Mon', sales: 0 },
    { labelKey: 'Tue', defaultLabel: 'Tue', sales: 0 },
    { labelKey: 'Wed', defaultLabel: 'Wed', sales: 0 },
    { labelKey: 'Thu', defaultLabel: 'Thu', sales: 0 },
    { labelKey: 'Fri', defaultLabel: 'Fri', sales: 0 },
    { labelKey: 'Sat', defaultLabel: 'Sat', sales: 0 },
    { labelKey: 'Sun', defaultLabel: 'Sun', sales: 0 },
  ],
  yearly: [
    { labelKey: '2021', defaultLabel: '2021', sales: 0 },
    { labelKey: '2022', defaultLabel: '2022', sales: 0 },
    { labelKey: '2023', defaultLabel: '2023', sales: 0 },
    { labelKey: '2024', defaultLabel: '2024', sales: 0 },
    { labelKey: '2025', defaultLabel: '2025', sales: 0 },
  ],
};

const totalsByPeriod: Record<PeriodKey, string> = {
  monthly: '--',
  weekly: '--',
  yearly: '--',
};

const chartConfig = {
  sales: {
    label: 'Sales',
    color: '#22c55e',
  },
} satisfies ChartConfig;

export default function RevenueSalesChart() {
  const { t } = useTranslation();
  const [periodKey, setPeriodKey] = useState<PeriodKey>('monthly');

  const chartData = dataByPeriod[periodKey].map((item) => ({
    label: t(`dashboardOverview.${item.labelKey.toLowerCase()}`, item.defaultLabel),
    sales: item.sales,
  }));

  const totalDisplay = totalsByPeriod[periodKey];

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
