import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../../components/ui/chart';

export interface ChartDataItem {
  label: string;
  sales: number;
}

interface RevenueSalesChartAreaProps {
  data: ChartDataItem[];
  config: ChartConfig;
}

export default function RevenueSalesChartArea({
  data,
  config,
}: RevenueSalesChartAreaProps) {
  return (
    <div className="w-full pt-2 overflow-hidden">
      <ChartContainer config={config} className="w-full h-44 aspect-auto overflow-hidden">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ left: 12, right: 12, top: 12, bottom: 4 }}
        >
          <defs>
            <linearGradient id="revenueFillGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          <Area
            dataKey="sales"
            type="monotone"
            fill="url(#revenueFillGradient)"
            stroke="#22c55e"
            strokeWidth={2.5}
            isAnimationActive={true}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
