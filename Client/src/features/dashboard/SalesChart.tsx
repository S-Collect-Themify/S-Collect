import { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, TrendingUp, Calendar, Check, AlertCircle, ArrowRight } from 'lucide-react';
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
import { useSubOrders } from '../Orders/useSubOrders';
import { formatCustomDateDisplay } from '../../components/ui/DateFilterDropdown';

import SalesChartSkeleton from './skeleton/SalesChartSkeleton';

type Period = 'month' | 'week' | 'day' | 'custom';

const chartConfig = {
  desktop: {
    label: 'Sales (SAR)',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

// ─── Portal-based dropdown with Custom Period support ─────────────────────────
function PeriodDropdown({
  options,
  value,
  customStart,
  customEnd,
  onChange,
  onCustomChange,
}: {
  options: { value: Period; label: string }[];
  value: Period;
  customStart: string;
  customEnd: string;
  onChange: (v: Period) => void;
  onCustomChange: (start: string, end: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [tempStart, setTempStart] = useState(customStart);
  const [tempEnd, setTempEnd] = useState(customEnd);
  const [showCustomInputs, setShowCustomInputs] = useState(value === 'custom');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(customStart);
    setTempEnd(customEnd);
    if (value === 'custom') {
      setShowCustomInputs(true);
    }
  }, [customStart, customEnd, value]);

  const updatePos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuWidth = 240;
    let left = isArabic ? r.left : r.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
    setPos({ top: r.bottom + 4, left });
  };

  useLayoutEffect(() => {
    if (open) updatePos();
  }, [open, isArabic]);

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
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
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

  const customFormattedLabel = useMemo(() => {
    if (value === 'custom' && (customStart || customEnd)) {
      return formatCustomDateDisplay(customStart, customEnd, isArabic);
    }
    return null;
  }, [value, customStart, customEnd, isArabic]);

  const selectedLabel =
    customFormattedLabel ||
    options.find((o) => o.value === value)?.label ||
    '';

  const handleApplyCustom = () => {
    if (tempStart && tempEnd && tempStart > tempEnd) {
      setErrorMessage(
        t('dateFilter.invalidDateRange', {
          defaultValue: 'Start date must be before or equal to end date',
        })
      );
      return;
    }

    setErrorMessage(null);
    onCustomChange(tempStart, tempEnd);
    onChange('custom');
    setOpen(false);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        type="button"
        className={`flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors ${
          value === 'custom' && (customStart || customEnd)
            ? 'border-gray-900/40 bg-gray-50 font-semibold text-gray-900'
            : ''
        }`}
      >
        <Calendar size={13} className="text-gray-400 shrink-0" />
        <span className="truncate max-w-[180px]">{selectedLabel}</span>
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
                width: 240,
                zIndex: 9999,
              }}
              className="rounded-xl border border-gray-200 bg-white py-1 text-xs shadow-xl overflow-hidden text-start"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    if (opt.value === 'custom') {
                      setShowCustomInputs(true);
                      return;
                    }
                    setShowCustomInputs(false);
                    setErrorMessage(null);
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full cursor-pointer px-3.5 py-2 flex items-center justify-between hover:bg-gray-50 text-start ${
                    opt.value === value
                      ? 'font-semibold text-gray-900 bg-gray-50'
                      : 'text-gray-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {opt.value === 'custom' && (
                      <Calendar size={12} className="text-gray-400" />
                    )}
                    <span>{opt.label}</span>
                  </span>
                  {opt.value === value && (
                    <Check size={13} className="text-gray-900 ms-2 shrink-0" />
                  )}
                </button>
              ))}

              <AnimatePresence initial={false}>
                {showCustomInputs && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-100 bg-gray-50/50 p-2.5 flex flex-col gap-2"
                  >
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {t('dateFilter.customPeriod', { defaultValue: 'Custom Period' })}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-medium text-gray-600">
                        {t('dateFilter.startDate', { defaultValue: 'Start Date' })}
                      </label>
                      <input
                        type="date"
                        value={tempStart}
                        onChange={(e) => {
                          setTempStart(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 outline-none focus:border-gray-900 cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-medium text-gray-600">
                        {t('dateFilter.endDate', { defaultValue: 'End Date' })}
                      </label>
                      <input
                        type="date"
                        value={tempEnd}
                        onChange={(e) => {
                          setTempEnd(e.target.value);
                          setErrorMessage(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded px-2 py-1 text-xs text-gray-800 outline-none focus:border-gray-900 cursor-pointer"
                      />
                    </div>

                    {errorMessage && (
                      <div className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 p-1.5 rounded border border-red-100">
                        <AlertCircle size={11} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTempStart(customStart);
                          setTempEnd(customEnd);
                          setErrorMessage(null);
                          setShowCustomInputs(false);
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-gray-600 hover:text-gray-900 rounded cursor-pointer"
                      >
                        {t('dateFilter.cancel', { defaultValue: 'Cancel' })}
                      </button>
                      <button
                        type="button"
                        onClick={handleApplyCustom}
                        disabled={!tempStart && !tempEnd}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-xs cursor-pointer"
                      >
                        <span>{t('dateFilter.apply', { defaultValue: 'Apply' })}</span>
                        <ArrowRight size={10} className="rtl:rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
  const { t, i18n } = useTranslation();
  const [period, setPeriod] = useState<Period>('month');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const { data: subOrdersData, isLoading } = useSubOrders({
    pageNum: 1,
    pageSize: 100,
  });

  const periodOptions: { value: Period; label: string }[] = [
    { value: 'month', label: t('salesChart.lastMonth') },
    { value: 'week', label: t('salesChart.lastWeek') },
    { value: 'day', label: t('salesChart.lastDay') },
    { value: 'custom', label: t('salesChart.customPeriod', { defaultValue: 'Custom Period' }) },
  ];

  const selectedOption = periodOptions.find((o) => o.value === period)!;

  const chartData = useMemo(() => {
    const orders = subOrdersData?.items || [];
    if (period === 'month') {
      const monthKeys = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const map: Record<string, number> = {};
      monthKeys.forEach((m) => (map[m] = 0));
      orders.forEach((o) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          if (!isNaN(d.getTime())) {
            const mKey = d.toLocaleString('en-US', { month: 'short' });
            const amt =
              typeof (o as any).totalAmount === 'number'
                ? (o as any).totalAmount
                : (o.items?.reduce((s, i) => s + (i.lineTotal || 0), 0) || 0) +
                  (o.shippingRateApplied || 0);
            if (map[mKey] !== undefined) map[mKey] += amt;
          }
        }
      });
      return monthKeys.map((m) => ({ label: m, desktop: Math.round(map[m]) }));
    } else if (period === 'week') {
      const weekKeys = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
      const map: Record<string, number> = {};
      weekKeys.forEach((w) => (map[w] = 0));
      orders.forEach((o) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          if (!isNaN(d.getTime())) {
            const wKey = d.toLocaleString('en-US', { weekday: 'short' });
            const amt =
              typeof (o as any).totalAmount === 'number'
                ? (o as any).totalAmount
                : (o.items?.reduce((s, i) => s + (i.lineTotal || 0), 0) || 0) +
                  (o.shippingRateApplied || 0);
            if (map[wKey] !== undefined) map[wKey] += amt;
          }
        }
      });
      return weekKeys.map((w) => ({ label: w, desktop: Math.round(map[w]) }));
    } else if (period === 'day') {
      const dayKeys = [
        '00:00',
        '04:00',
        '08:00',
        '12:00',
        '16:00',
        '20:00',
        '23:59',
      ];
      const map: Record<string, number> = {};
      dayKeys.forEach((k) => (map[k] = 0));
      orders.forEach((o) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          if (!isNaN(d.getTime())) {
            const hr = d.getHours();
            let k = '00:00';
            if (hr >= 20) k = '20:00';
            else if (hr >= 16) k = '16:00';
            else if (hr >= 12) k = '12:00';
            else if (hr >= 8) k = '08:00';
            else if (hr >= 4) k = '04:00';
            const amt =
              typeof (o as any).totalAmount === 'number'
                ? (o as any).totalAmount
                : (o.items?.reduce((s, i) => s + (i.lineTotal || 0), 0) || 0) +
                  (o.shippingRateApplied || 0);
            if (map[k] !== undefined) map[k] += amt;
          }
        }
      });
      return dayKeys.map((k) => ({ label: k, desktop: Math.round(map[k]) }));
    } else {
      // Custom Period daily aggregation
      const start = customStart
        ? new Date(`${customStart}T00:00:00`)
        : new Date(Date.now() - 14 * 86400000);
      const end = customEnd
        ? new Date(`${customEnd}T23:59:59.999`)
        : new Date();

      const map: Record<string, { label: string; desktop: number }> = {};
      const current = new Date(start);
      const isArabic = i18n.language === 'ar';

      // Limit iteration to prevent infinite loops (max 366 days)
      let count = 0;
      while (current <= end && count < 366) {
        const key = current.toISOString().split('T')[0];
        const label = current.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
          month: 'short',
          day: 'numeric',
        });
        map[key] = { label, desktop: 0 };
        current.setDate(current.getDate() + 1);
        count++;
      }

      orders.forEach((o) => {
        if (o.createdAt) {
          const d = new Date(o.createdAt);
          if (!isNaN(d.getTime()) && d >= start && d <= end) {
            const key = d.toISOString().split('T')[0];
            const amt =
              typeof (o as any).totalAmount === 'number'
                ? (o as any).totalAmount
                : (o.items?.reduce((s, i) => s + (i.lineTotal || 0), 0) || 0) +
                  (o.shippingRateApplied || 0);
            if (map[key]) {
              map[key].desktop += amt;
            }
          }
        }
      });

      const list = Object.values(map);
      return list.length > 0
        ? list.map((v) => ({ label: v.label, desktop: Math.round(v.desktop) }))
        : [{ label: '-', desktop: 0 }];
    }
  }, [subOrdersData?.items, period, customStart, customEnd, i18n.language]);

  if (isLoading) {
    return <SalesChartSkeleton />;
  }

  const footerDisplayLabel =
    period === 'custom' && (customStart || customEnd)
      ? formatCustomDateDisplay(customStart, customEnd, i18n.language === 'ar')
      : selectedOption.label;

  return (
    <Card className="lg:h-[512px] lg:flex lg:flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex flex-col space-y-1.5">
            <CardTitle>{t('salesChart.pointStyle')}</CardTitle>
            <CardDescription>{t('salesChart.sales')}</CardDescription>
          </div>
          <PeriodDropdown
            options={periodOptions}
            value={period}
            customStart={customStart}
            customEnd={customEnd}
            onChange={setPeriod}
            onCustomChange={(start, end) => {
              setCustomStart(start);
              setCustomEnd(end);
            }}
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
              bottom: 8,
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
              tickFormatter={(value) => value.slice(0, 6)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="desktop"
              type="monotone"
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
              {footerDisplayLabel} <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-gray-500">
              {t('salesChart.sales', { defaultValue: 'Sales' })}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
