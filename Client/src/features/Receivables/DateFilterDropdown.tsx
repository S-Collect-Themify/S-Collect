import SharedDateFilterDropdown, {
  DEFAULT_DATE_FILTER_PRESETS,
  getDateRangeFromPreset,
  formatCustomDateDisplay,
  type DateOption,
  type DateRangeResult,
  type DateFilterDropdownProps,
} from '../../components/ui/DateFilterDropdown';

export const DATE_FILTER_PRESETS: DateOption[] = DEFAULT_DATE_FILTER_PRESETS.map((preset) => ({
  value: preset.value,
  labelKey:
    preset.value === 'all'
      ? 'receivables.allDates'
      : preset.value === '7'
      ? 'receivables.last7Days'
      : preset.value === '30'
      ? 'receivables.last30Days'
      : preset.value === '90'
      ? 'receivables.last90Days'
      : preset.value === 'thisMonth'
      ? 'receivables.thisMonth'
      : preset.value === 'lastMonth'
      ? 'receivables.lastMonth'
      : 'receivables.customPeriod',
  defaultLabel: preset.defaultLabel,
}));

export { getDateRangeFromPreset, formatCustomDateDisplay };
export type { DateOption, DateRangeResult, DateFilterDropdownProps };

export default function DateFilterDropdown({
  selected,
  customStartDate,
  customEndDate,
  onChange,
  align = 'right',
  className = '',
  buttonClassName = '',
}: {
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
  align?: 'left' | 'right';
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <SharedDateFilterDropdown
      selected={selected}
      customStartDate={customStartDate}
      customEndDate={customEndDate}
      onChange={onChange}
      presets={DATE_FILTER_PRESETS}
      align={align}
      className={className}
      buttonClassName={buttonClassName}
    />
  );
}
