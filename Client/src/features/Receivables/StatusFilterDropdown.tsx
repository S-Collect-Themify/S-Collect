import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Filter } from 'lucide-react';
import PortalDropdown from '../../components/ui/PortalDropdown';
import { STATUS_FILTERS, type TransactionStatus } from './constants';

type StatusFilter = TransactionStatus | 'all';

export default function StatusFilterDropdown({
  selected,
  onChange,
}: {
  selected: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  const { t } = useTranslation();

  const options: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('receivables.all', { defaultValue: 'All Statuses' }) },
    ...STATUS_FILTERS.map((s) => ({
      value: s as StatusFilter,
      label: t(`receivables.statuses.${s.toLowerCase()}`, { defaultValue: s }),
    })),
  ];

  const current = options.find((o) => o.value === selected) || options[0];

  return (
    <PortalDropdown
      align="right"
      minWidth={160}
      animate
      menuClassName="bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 overflow-hidden z-50"
      trigger={({ isOpen, toggle }) => (
        <button
          onClick={toggle}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 h-10 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Filter size={14} className="text-gray-400 shrink-0" />
          <span>{current?.label}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0"
          >
            <ChevronDown size={14} className="text-gray-400" />
          </motion.span>
        </button>
      )}
    >
      {({ close }) => (
        <>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                close();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors hover:bg-gray-50 text-start ${
                option.value === selected
                  ? 'bg-gray-50 font-semibold text-gray-900'
                  : 'text-gray-600'
              }`}
            >
              <span>{option.label}</span>
              {option.value === selected && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-900 ms-2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </>
      )}
    </PortalDropdown>
  );
}
