'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '../../components/ui/chart';
import { motion, AnimatePresence } from 'motion/react';

type Period = 'month' | 'week' | 'day';

const monthlyData = [
  { label: 'January', desktop: 186 },
  { label: 'February', desktop: 305 },
  { label: 'March', desktop: 237 },
  { label: 'April', desktop: 73 },
  { label: 'May', desktop: 209 },
  { label: 'June', desktop: 214 },
  { label: 'July', desktop: 168 },
  { label: 'August', desktop: 295 },
  { label: 'September', desktop: 232 },
  { label: 'October', desktop: 182 },
  { label: 'November', desktop: 276 },
  { label: 'December', desktop: 312 },
];

const weeklyData = [
  { label: 'Sat', desktop: 124 },
  { label: 'Sun', desktop: 198 },
  { label: 'Mon', desktop: 156 },
  { label: 'Tue', desktop: 241 },
  { label: 'Wed', desktop: 178 },
  { label: 'Thu', desktop: 263 },
  { label: 'Fri', desktop: 195 },
];

const dailyData = [
  { label: '00:00', desktop: 42 },
  { label: '04:00', desktop: 28 },
  { label: '08:00', desktop: 67 },
  { label: '12:00', desktop: 134 },
  { label: '16:00', desktop: 189 },
  { label: '20:00', desktop: 112 },
  { label: '23:59', desktop: 78 },
];

const dataByPeriod: Record<Period, { label: string; desktop: number }[]> = {
  month: monthlyData,
  week: weeklyData,
  day: dailyData,
};

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

// ─── Portal-based dropdown — لا يُضيف overflow-hidden على الـ body ────────────
function PeriodDropdown({
  options,
  value,
  onChange,
}: {
  options: { value: Period; label: string }[];
  value: Period;
  onChange: (v: Period) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 4, left: r.right - 144 });
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        menuRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    const onResize = () => updatePos();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 focus:outline-none"
      >
        {selectedLabel}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </motion.span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                width: 144,
                zIndex: 9999,
              }}
              className="rounded-lg border border-gray-200 bg-white py-1 text-xs shadow-lg"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full cursor-pointer px-3 py-2 text-left hover:bg-gray-50 ${
                    opt.value === value
                      ? 'font-medium text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SalesChart() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('month');

  const periodOptions: { value: Period; label: string }[] = [
    { value: 'month', label: t('salesChart.lastMonth') },
    { value: 'week', label: t('salesChart.lastWeek') },
    { value: 'day', label: t('salesChart.lastDay') },
  ];

  const selectedOption = periodOptions.find((o) => o.value === period)!;
  const chartData = dataByPeriod[period];

  return (
    <Card className="lg:h-[512px] lg:flex lg:flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>{t('salesChart.pointStyle')}</CardTitle>
            <CardDescription>{t('salesChart.sales')}</CardDescription>
          </div>
          <PeriodDropdown
            options={periodOptions}
            value={period}
            onChange={setPeriod}
          />
        </div>
      </CardHeader>
      <CardContent className="lg:flex-1">
        <ChartContainer
          config={chartConfig}
          className="lg:aspect-auto lg:h-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="50%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillGradient)"
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {selectedOption.label} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">
              {selectedOption.label}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
