import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Buyer } from '../types/buyers';
import { getInitials } from '../utils/buyerUtils';

interface BuyerDesktopTableProps {
  paginated: Buyer[];
  isLoading?: boolean;
  allChecked: boolean;
  toggleAll: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedRows: string[];
  toggleRow: (id: string) => void;
  onToggleStatus: (buyer: Buyer) => void;
}

export default function BuyerDesktopTable({
  paginated,
  isLoading,
  allChecked,
  toggleAll,
  selectedRows,
  toggleRow,
  onToggleStatus,
}: BuyerDesktopTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    let badgeClass = 'bg-gray-100 text-gray-600';
    let label = status || '---';

    if (s === 'ACTIVE') {
      badgeClass = 'bg-green-100 text-green-700';
      label = t('buyers.table.statusActive', 'Active');
    } else if (s === 'PENDING_VERIFICATION') {
      badgeClass = 'bg-amber-100 text-amber-700';
      label = t('buyers.table.statusPendingVerification', 'Pending Verification');
    } else if (s === 'LOCKED') {
      badgeClass = 'bg-orange-100 text-orange-700';
      label = t('buyers.table.statusLocked', 'Locked');
    } else if (s === 'DEACTIVATED' || s === 'SUSPENDED') {
      badgeClass = 'bg-red-100 text-red-600';
      label = t('buyers.table.statusDeactivated', 'Deactivated');
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto hidden md:block">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="w-9 px-3 py-3 border-b border-gray-200 text-start bg-gray-50">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="accent-black w-4 h-4 cursor-pointer rounded"
              />
            </th>
            {[
              t('buyers.table.fullName', 'Full Name'),
              t('buyers.table.email', 'Email'),
              t('buyers.table.date', 'Date'),
              t('buyers.table.ordersNum', 'Orders num'),
              t('buyers.table.status', 'Status'),
              t('buyers.table.activate', 'Activate'),
              t('buyers.table.action', 'Action'),
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 border-b border-gray-200 text-start text-xs font-semibold text-gray-500 whitespace-nowrap bg-gray-50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 7 }).map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100 bg-white">
                <td className="w-9 px-3 py-4">
                  <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
                    <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
                  </div>
                </td>
                {Array.from({ length: 6 }).map((_, cIdx) => (
                  <td key={cIdx} className="px-4 py-4">
                    <div
                      className={`h-4 rounded bg-gray-200 animate-pulse ${
                        cIdx % 2 === 0 ? 'w-28' : 'w-20'
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-gray-400 bg-white">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                    <i className="ti ti-users text-2xl text-gray-400" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-gray-400">{t('buyers.table.noResults', 'No buyers found')}</p>
                </div>
              </td>
            </tr>
          ) : (
            paginated.map((buyer) => {
              const isActive = (buyer.status || '').toUpperCase() === 'ACTIVE';
              const isSelected = selectedRows.includes(buyer.id);
              const displayName = buyer.name || '---';
              const displayEmail = buyer.email || '---';
              const displayDate = buyer.date || '---';
              const displayOrders = buyer.ordersNum ?? '---';

              return (
                <tr
                  key={buyer.id}
                  className={`border-b border-gray-100 transition-colors ${
                    isSelected ? 'bg-indigo-50/40' : 'bg-white hover:bg-gray-50/50'
                  }`}
                >
                  {/* Checkbox column */}
                  <td className="w-9 px-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(buyer.id)}
                      className="accent-black w-4 h-4 cursor-pointer rounded"
                    />
                  </td>

                  {/* Full Name */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E9E9E9] text-gray-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {getInitials(displayName)}
                      </div>
                      <span className="font-medium text-gray-800 text-sm whitespace-nowrap">
                        {displayName}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {displayEmail}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                    {displayDate}
                  </td>

                  {/* Orders num */}
                  <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">
                    {displayOrders}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    {renderStatusBadge(buyer.status)}
                  </td>

                  {/* Activate toggle */}
                  <td className="px-4 py-3.5">
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
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => navigate(`/buyers/${buyer.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
                    >
                      {t('buyers.table.viewDetails', 'View details')}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
