import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PortalDropdown from '../../../components/ui/PortalDropdown';

interface OrderFiltersProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSortChange: (value: 'newest' | 'oldest') => void;
  sortNewest: boolean;
}

export const OrderFilters = ({
  activeTab,
  onTabChange,
  onSortChange,
  sortNewest,
}: OrderFiltersProps) => {
  const { t } = useTranslation();

  const SORT_OPTIONS = [
    { value: 'newest' as const, label: t('ordersPage.newestFirst') },
    { value: 'oldest' as const, label: t('ordersPage.oldestFirst') },
  ];

  const FILTER_TABS = [
    { key: 'allOrders', label: t('ordersPage.allOrders') },
    { key: 'PENDING', label: t('ordersPage.pending') },
    { key: 'PROCESSING', label: t('ordersPage.processing') },
    { key: 'SHIPPED', label: t('ordersPage.shipped') },
    { key: 'DELIVERED', label: t('ordersPage.delivered') },
    { key: 'CANCELLED', label: t('ordersPage.cancelled', 'Cancelled') },
  ];

  const currentSort = sortNewest ? 'newest' : 'oldest';

  return (
    <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-white'
                : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {/* Active tab background with smooth layout animation */}
            {activeTab === tab.key && (
              <motion.div
                layoutId="orders-active-tab"
                className="absolute inset-0 bg-gray-900 rounded-lg"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 35,
                  mass: 0.8,
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs">{t('ordersPage.sortBy')}:</span>

        <PortalDropdown
          align="right"
          minWidth={160}
          animate
          menuClassName="bg-white rounded-lg border border-gray-200 shadow-lg py-1 overflow-hidden"
          trigger={({ isOpen, toggle }) => (
            <button
              onClick={toggle}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer sm:w-fit w-full justify-center"
            >
              {sortNewest
                ? t('ordersPage.newestFirst')
                : t('ordersPage.oldestFirst')}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={14} className="text-gray-400" />
              </motion.span>
            </button>
          )}
        >
          {({ close }) => (
            <>
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    close();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                    option.value === currentSort
                      ? 'bg-gray-50 font-medium text-gray-900'
                      : 'text-gray-600'
                  }`}
                >
                  {option.label}
                  {option.value === currentSort && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ml-auto text-gray-900"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </>
          )}
        </PortalDropdown>
      </div>
    </div>
  );
};
