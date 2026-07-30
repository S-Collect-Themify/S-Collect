import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

interface ReturnFilterBarProps {
  search: string;
  statusFilter: string;
  dateFilter: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
  onDateFilterChange: (val: string) => void;
}

export function ReturnFilterBar({
  search,
  statusFilter,
  dateFilter,
  onSearchChange,
  onStatusFilterChange,
  onDateFilterChange,
}: ReturnFilterBarProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5"
    >
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('returnsPage.searchPlaceholder', {
            defaultValue: 'Search by ID or Customer...',
          })}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-900 transition-colors bg-gray-50/50"
        />
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
        <div className="relative flex-1 sm:flex-initial">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-medium text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
          >
            <option value="ALL">
              {t('returnsPage.allStatuses', {
                defaultValue: 'Status: All Statuses',
              })}
            </option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="AWAITING_ITEM">Awaiting Item</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        <div className="relative flex-1 sm:flex-initial">
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pl-3.5 pr-9 text-xs sm:text-sm font-medium text-gray-700 outline-none focus:border-gray-900 cursor-pointer"
          >
            <option value="ALL">
              {t('returnsPage.allTime', {
                defaultValue: 'All Dates',
              })}
            </option>
            <option value="7">Last 7 Days</option>
            <option value="30">
              {t('returnsPage.last30Days', {
                defaultValue: 'Last 30 Days',
              })}
            </option>
            <option value="90">Last 90 Days</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      </div>
    </motion.div>
  );
}
