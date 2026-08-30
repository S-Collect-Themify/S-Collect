import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Calendar, Check, AlertCircle, ArrowRight } from 'lucide-react';
import PortalDropdown from './PortalDropdown';

export interface DateOption {
  value: string;
  labelKey: string;
  defaultLabel: string;
}

export const DEFAULT_DATE_FILTER_PRESETS: DateOption[] = [
  { value: 'all', labelKey: 'dateFilter.allDates', defaultLabel: 'All Dates' },
  { value: '7', labelKey: 'dateFilter.last7Days', defaultLabel: 'Last 7 Days' },
  { value: '30', labelKey: 'dateFilter.last30Days', defaultLabel: 'Last 30 Days' },
  { value: '90', labelKey: 'dateFilter.last90Days', defaultLabel: 'Last 90 Days' },
  { value: 'thisMonth', labelKey: 'dateFilter.thisMonth', defaultLabel: 'This Month' },
  { value: 'lastMonth', labelKey: 'dateFilter.lastMonth', defaultLabel: 'Last Month' },
  { value: 'custom', labelKey: 'dateFilter.customPeriod', defaultLabel: 'Custom Period' },
];

export interface DateRangeResult {
  dateFrom?: string; // ISO string for start of day (UTC/Local)
  dateTo?: string;   // ISO string for end of day (UTC/Local)
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export function getDateRangeFromPreset(
  preset: string,
  customStart?: string,
  customEnd?: string
): DateRangeResult {
  const normalized = (preset || '').toLowerCase();
  const now = new Date();
  const todayEnd = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  if (normalized === '7') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
    return {
      dateFrom: from.toISOString(),
      dateTo: todayEnd.toISOString(),
      startDate: from.toISOString().split('T')[0],
      endDate: todayEnd.toISOString().split('T')[0],
    };
  }

  if (normalized === '30') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
    return {
      dateFrom: from.toISOString(),
      dateTo: todayEnd.toISOString(),
      startDate: from.toISOString().split('T')[0],
      endDate: todayEnd.toISOString().split('T')[0],
    };
  }

  if (normalized === '90') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90, 0, 0, 0, 0);
    return {
      dateFrom: from.toISOString(),
      dateTo: todayEnd.toISOString(),
      startDate: from.toISOString().split('T')[0],
      endDate: todayEnd.toISOString().split('T')[0],
    };
  }

  if (normalized === 'thismonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return {
      dateFrom: from.toISOString(),
      dateTo: todayEnd.toISOString(),
      startDate: from.toISOString().split('T')[0],
      endDate: todayEnd.toISOString().split('T')[0],
    };
  }

  if (normalized === 'lastmonth') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return {
      dateFrom: from.toISOString(),
      dateTo: to.toISOString(),
      startDate: from.toISOString().split('T')[0],
      endDate: to.toISOString().split('T')[0],
    };
  }

  if (normalized === 'custom') {
    let dateFrom: string | undefined;
    let dateTo: string | undefined;

    if (customStart) {
      const from = new Date(`${customStart}T00:00:00`);
      if (!isNaN(from.getTime())) {
        dateFrom = from.toISOString();
      }
    }

    if (customEnd) {
      const to = new Date(`${customEnd}T23:59:59.999`);
      if (!isNaN(to.getTime())) {
        dateTo = to.toISOString();
      }
    }

    return {
      dateFrom,
      dateTo,
      startDate: customStart,
      endDate: customEnd,
    };
  }

  return { dateFrom: undefined, dateTo: undefined, startDate: undefined, endDate: undefined };
}

export function formatCustomDateDisplay(
  startDate?: string,
  endDate?: string,
  isArabic = false
): string {
  if (!startDate && !endDate) return '';

  const formatDate = (dStr: string) => {
    const d = new Date(dStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (startDate && endDate) {
    if (startDate === endDate) {
      return formatDate(startDate);
    }
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }
  if (startDate) {
    return isArabic ? `من ${formatDate(startDate)}` : `From ${formatDate(startDate)}`;
  }
  if (endDate) {
    return isArabic ? `حتى ${formatDate(endDate)}` : `Until ${formatDate(endDate)}`;
  }
  return '';
}

export interface DateFilterDropdownProps {
  selected: string;
  customStartDate?: string;
  customEndDate?: string;
  onChange: (
    value: string,
    customRange?: {
      startDate?: string;
      endDate?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) => void;
  presets?: DateOption[];
  align?: 'left' | 'right';
  className?: string;
  buttonClassName?: string;
  minWidth?: number;
}

export default function DateFilterDropdown({
  selected,
  customStartDate = '',
  customEndDate = '',
  onChange,
  presets = DEFAULT_DATE_FILTER_PRESETS,
  align = 'right',
  className = '',
  buttonClassName = '',
  minWidth = 220,
}: DateFilterDropdownProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [tempStart, setTempStart] = useState(customStartDate);
  const [tempEnd, setTempEnd] = useState(customEndDate);
  const [showCustomInputs, setShowCustomInputs] = useState(
    selected.toLowerCase() === 'custom'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync internal temp states when props change
  useEffect(() => {
    setTempStart(customStartDate);
    setTempEnd(customEndDate);
    if (selected.toLowerCase() === 'custom') {
      setShowCustomInputs(true);
    }
  }, [customStartDate, customEndDate, selected]);

  const options = useMemo(() => {
    return presets.map((p) => ({
      value: p.value,
      label: t(p.labelKey, { defaultValue: p.defaultLabel }),
    }));
  }, [presets, t]);

  // Determine current active button label
  const isCustom = selected.toLowerCase() === 'custom';
  const customFormattedLabel = useMemo(() => {
    if (isCustom && (customStartDate || customEndDate)) {
      return formatCustomDateDisplay(customStartDate, customEndDate, isArabic);
    }
    return null;
  }, [isCustom, customStartDate, customEndDate, isArabic]);

  const currentOption = options.find(
    (o) => o.value.toLowerCase() === selected.toLowerCase()
  );
  
  const triggerLabel =
    customFormattedLabel ||
    currentOption?.label ||
    t('dateFilter.allDates', { defaultValue: 'All Dates' });

  const handleApplyCustom = (closeMenu: () => void) => {
    if (tempStart && tempEnd && tempStart > tempEnd) {
      setErrorMessage(
        t('dateFilter.invalidDateRange', {
          defaultValue: 'Start date must be before or equal to end date',
        })
      );
      return;
    }

    setErrorMessage(null);
    const range = getDateRangeFromPreset('custom', tempStart, tempEnd);
    onChange('custom', {
      startDate: tempStart,
      endDate: tempEnd,
      dateFrom: range.dateFrom,
      dateTo: range.dateTo,
    });
    closeMenu();
  };

  const handlePresetSelect = (val: string, closeMenu: () => void) => {
    if (val === 'custom') {
      setShowCustomInputs(true);
      return;
    }

    setShowCustomInputs(false);
    setErrorMessage(null);
    const range = getDateRangeFromPreset(val);
    onChange(val, range);
    closeMenu();
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <PortalDropdown
        align={align}
        minWidth={minWidth}
        animate
        menuClassName="bg-white rounded-xl border border-gray-200 shadow-xl py-1.5 overflow-hidden z-50 text-start"
        trigger={({ isOpen, toggle }) => (
          <button
            onClick={toggle}
            type="button"
            className={`inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 h-10 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer select-none ${
              isCustom && (customStartDate || customEndDate)
                ? 'border-gray-900/40 bg-gray-50/70 font-semibold text-gray-900'
                : ''
            } ${buttonClassName}`}
          >
            <Calendar
              size={15}
              className={`shrink-0 ${
                isCustom && (customStartDate || customEndDate)
                  ? 'text-gray-900'
                  : 'text-gray-400'
              }`}
            />
            <span className="truncate max-w-[200px] sm:max-w-[260px]">
              {triggerLabel}
            </span>
            <motion.span
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 ms-auto"
            >
              <ChevronDown size={14} className="text-gray-400" />
            </motion.span>
          </button>
        )}
      >
        {({ close }) => (
          <div className="w-full max-w-[290px] sm:max-w-[320px]">
            {/* Presets List */}
            <div className="py-1">
              {options.map((option) => {
                const isSelected =
                  option.value.toLowerCase() === selected.toLowerCase();
                const isOptionCustom = option.value === 'custom';

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePresetSelect(option.value, close)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors hover:bg-gray-50 text-start cursor-pointer ${
                      isSelected
                        ? 'bg-gray-50 font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isOptionCustom && (
                        <Calendar size={13} className="text-gray-400" />
                      )}
                      <span>{option.label}</span>
                    </span>
                    {isSelected && (
                      <Check size={14} className="text-gray-900 ms-2 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Period Input Panel */}
            <AnimatePresence initial={false}>
              {showCustomInputs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-t border-gray-100 bg-gray-50/50 p-3 flex flex-col gap-2.5"
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    {t('dateFilter.customPeriod', { defaultValue: 'Custom Period' })}
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-gray-600">
                      {t('dateFilter.startDate', { defaultValue: 'Start Date' })}
                    </label>
                    <input
                      type="date"
                      value={tempStart}
                      onChange={(e) => {
                        setTempStart(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-gray-900 transition-colors cursor-pointer"
                    />
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium text-gray-600">
                      {t('dateFilter.endDate', { defaultValue: 'End Date' })}
                    </label>
                    <input
                      type="date"
                      value={tempEnd}
                      onChange={(e) => {
                        setTempEnd(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-gray-900 transition-colors cursor-pointer"
                    />
                  </div>

                  {/* Error Alert */}
                  {errorMessage && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                      <AlertCircle size={13} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTempStart(customStartDate);
                        setTempEnd(customEndDate);
                        setErrorMessage(null);
                        setShowCustomInputs(false);
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      {t('dateFilter.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyCustom(close)}
                      disabled={!tempStart && !tempEnd}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <span>{t('dateFilter.apply', { defaultValue: 'Apply' })}</span>
                      <ArrowRight size={12} className="rtl:rotate-180" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </PortalDropdown>
    </div>
  );
}
