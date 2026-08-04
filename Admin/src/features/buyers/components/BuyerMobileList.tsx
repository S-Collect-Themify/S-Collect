import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Buyer } from '../types/buyers';
import { getInitials } from '../utils/buyerUtils';

interface BuyerMobileListProps {
  paginated: Buyer[];
  isLoading?: boolean;
  allChecked: boolean;
  toggleAll: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  selectedRows: string[];
  toggleRow: (id: string) => void;
  onToggleStatus: (buyer: Buyer) => void;
}

export default function BuyerMobileList({
  paginated,
  isLoading,
  allChecked,
  toggleAll,
  selectedCount,
  selectedRows,
  toggleRow,
  onToggleStatus,
}: BuyerMobileListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    let badgeClass = 'bg-gray-100 text-gray-600';
    let label = status || '---';

    if (s === 'ACTIVE') {
      badgeClass = 'bg-emerald-100/80 text-emerald-700';
      label = t('buyers.table.statusActive', 'Active');
    } else if (s === 'PENDING_VERIFICATION') {
      badgeClass = 'bg-amber-100/80 text-amber-700';
      label = t('buyers.table.statusPendingVerification', 'Pending Verification');
    } else if (s === 'LOCKED') {
      badgeClass = 'bg-orange-100/80 text-orange-700';
      label = t('buyers.table.statusLocked', 'Locked');
    } else if (s === 'DEACTIVATED' || s === 'SUSPENDED') {
      badgeClass = 'bg-rose-100/80 text-rose-700';
      label = t('buyers.table.statusDeactivated', 'Deactivated');
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="md:hidden space-y-3">
      {/* Mobile Select All Bar */}
      {paginated.length > 0 && !isLoading && (
        <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-2.5 shadow-2xs mb-2">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-gray-800">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={toggleAll}
              className="accent-black w-4 h-4 cursor-pointer rounded"
            />
            <span>{t('selectAll', 'Select All')}</span>
          </label>
          {selectedCount > 0 && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {selectedCount} selected
            </span>
          )}
        </div>
      )}

      {isLoading ? (
        Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="w-32 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="w-40 h-3 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          </div>
        ))
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="ti ti-users text-xl text-gray-400" aria-hidden="true" />
            </div>
            <p className="text-sm">{t('buyers.table.noResults', 'No buyers found')}</p>
          </div>
        </div>
      ) : (
        paginated.map((buyer) => {
          const isActive = (buyer.status || '').toUpperCase() === 'ACTIVE';
          const isSelected = selectedRows.includes(buyer.id);
          const displayName = buyer.name || '---';
          const displayEmail = buyer.email || '---';
          const displayDate = buyer.date || '---';
          const displayOrders = buyer.ordersNum ?? '---';

          return (
            <div
              key={buyer.id}
              className={`rounded-2xl border border-gray-100 p-4 shadow-2xs transition-colors ${
                isSelected ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white'
              }`}
            >
              {/* Header row: Avatar + Name + Checkbox */}
              <div className="flex items-start gap-3 mb-1">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRow(buyer.id)}
                  className="accent-black w-4 h-4 cursor-pointer rounded mt-3 shrink-0"
                />
                <div className="w-10 h-10 rounded-full bg-[#E9E9E9] text-gray-800 text-xs font-bold flex items-center justify-center shrink-0">
                  {getInitials(displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{displayName}</h3>
                  <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                </div>
              </div>

              {/* Info row: Date & Orders */}
              <div className="flex items-center justify-between text-xs text-gray-400 my-2.5 ps-7">
                <span>
                  {t('buyers.table.dateLabel', 'Date:')} {displayDate}
                </span>
                <span className="text-gray-900">
                  {t('buyers.table.ordersLabel', 'Orders:')}{' '}
                  <strong className="font-semibold">{displayOrders}</strong>
                </span>
              </div>

              {/* Action row: Status pill + Toggle + View details */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100/80 ps-7">
                <div className="flex items-center gap-2.5">
                  {renderStatusBadge(buyer.status)}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isActive}
                    dir="ltr"
                    onClick={() => onToggleStatus(buyer)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                      isActive ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => navigate(`/buyers/${buyer.id}`)}
                  className="text-xs font-bold text-gray-900 underline hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {t('buyers.table.viewDetails', 'View details')}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
