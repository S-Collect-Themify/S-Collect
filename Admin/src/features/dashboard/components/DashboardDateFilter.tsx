import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import PortalDropdown from '../../../components/ui/PortalDropdown';

export interface DateRangeOption {
  key: string;
  defaultLabel: string;
}

interface DashboardDateFilterProps {
  dateRangeKey: string;
  customFrom: string;
  customTo: string;
  onSelectPreset: (key: string) => void;
  onApplyCustom: (from: string, to: string) => void;
}

export const PRESET_DATE_RANGES: DateRangeOption[] = [
  { key: 'last7Days', defaultLabel: 'Last 7 Days' },
  { key: 'last30Days', defaultLabel: 'Last 30 Days' },
  { key: 'thisMonth', defaultLabel: 'This Month' },
  { key: 'thisYear', defaultLabel: 'This Year' },
];

export const DashboardDateFilter: React.FC<DashboardDateFilterProps> = ({
  dateRangeKey,
  customFrom,
  customTo,
  onSelectPreset,
  onApplyCustom,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [showCustomInputs, setShowCustomInputs] = useState(dateRangeKey === 'custom');
  const [tempFrom, setTempFrom] = useState(customFrom);
  const [tempTo, setTempTo] = useState(customTo);
  const [error, setError] = useState<string | null>(null);

  const getTriggerLabel = () => {
    if (dateRangeKey === 'custom' && customFrom && customTo) {
      return `${customFrom} ${isRtl ? '←' : '→'} ${customTo}`;
    }
    const match = PRESET_DATE_RANGES.find((r) => r.key === dateRangeKey);
    return t(`dashboardOverview.${dateRangeKey}`, match?.defaultLabel ?? '');
  };

  const handleApply = (close: () => void) => {
    if (!tempFrom || !tempTo) {
      setError(t('dashboardOverview.invalidDateRange', 'Please select both dates'));
      return;
    }
    if (tempFrom > tempTo) {
      setError(t('dashboardOverview.invalidDateRange', 'Start date must be before end date'));
      return;
    }
    setError(null);
    onApplyCustom(tempFrom, tempTo);
    close();
  };

  return (
    <PortalDropdown
      minWidth={280}
      animate={false}
      menuClassName="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 p-2"
      trigger={({ isOpen, toggle }) => (
        <button
          onClick={() => {
            setTempFrom(customFrom);
            setTempTo(customTo);
            setShowCustomInputs(dateRangeKey === 'custom');
            setError(null);
            toggle();
          }}
          className="flex items-center gap-2 h-9 px-3.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
        >
          <Calendar size={14} className="text-gray-400 shrink-0" />
          <span className="font-semibold text-gray-800">{getTriggerLabel()}</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 text-gray-400 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}
    >
      {({ close }) => (
        <div className="space-y-2">
          {/* Preset Buttons */}
          <div className="flex flex-col gap-0.5 pb-1.5 border-b border-gray-100">
            {PRESET_DATE_RANGES.map((r) => {
              const isSelected = dateRangeKey === r.key && !showCustomInputs;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setShowCustomInputs(false);
                    setError(null);
                    onSelectPreset(r.key);
                    close();
                  }}
                  className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{t(`dashboardOverview.${r.key}`, r.defaultLabel)}</span>
                  {isSelected && <Check size={14} className="text-green-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Option Toggle */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowCustomInputs((prev) => !prev);
                setError(null);
              }}
              className={`w-full text-start px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                dateRangeKey === 'custom' || showCustomInputs
                  ? 'bg-gray-100 text-gray-900 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{t('dashboardOverview.customRange', 'Custom Range')}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${
                  showCustomInputs ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Expandable Custom Date Inputs */}
            {showCustomInputs && (
              <div className="mt-2.5 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100 space-y-2.5">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-500">
                    {t('dashboardOverview.fromDate', 'From Date')}
                  </label>
                  <input
                    type="date"
                    value={tempFrom}
                    onChange={(e) => {
                      setTempFrom(e.target.value);
                      setError(null);
                    }}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-gray-500">
                    {t('dashboardOverview.toDate', 'To Date')}
                  </label>
                  <input
                    type="date"
                    value={tempTo}
                    onChange={(e) => {
                      setTempTo(e.target.value);
                      setError(null);
                    }}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                  />
                </div>

                {error && <p className="text-[10px] font-medium text-rose-500">{error}</p>}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApply(close)}
                    className="flex-1 h-7.5 bg-black hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {t('dashboardOverview.apply', 'Apply')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInputs(false);
                      setError(null);
                    }}
                    className="px-2.5 h-7.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-md transition-colors cursor-pointer"
                  >
                    {t('dashboardOverview.cancel', 'Cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalDropdown>
  );
};

export default DashboardDateFilter;
