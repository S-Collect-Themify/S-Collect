import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import Toggle from '../../mangement/Toggle';
import type { Vendor, VendorTab } from '../types/vendors';

type ModalType = 'approve' | 'reject' | 'deactivate' | 'reactivate';

interface VendorDesktopTableProps {
  paginated: Vendor[];
  tableHeaders: string[];
  colSpan: number;
  allChecked: boolean;
  toggleAll: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedRows: string[];
  toggleRow: (id: string) => void;
  activeTab: VendorTab;
  isAllTab: boolean;
  openConfirm: (type: ModalType, ids: string[], vendorName?: string) => void;
  toggleVendorActive: (id: string) => void;
  isLoading?: boolean;
}

export default function VendorDesktopTable({
  paginated,
  tableHeaders,
  colSpan,
  allChecked,
  toggleAll,
  selectedRows,
  toggleRow,
  activeTab,
  isAllTab,
  openConfirm,
  toggleVendorActive,
  isLoading,
}: VendorDesktopTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto hidden md:block">
      <table className="w-full border-collapse text-sm bg-gray-100">
        <thead>
          <tr>
            <th className="w-9 px-3 py-3 border-b border-gray-200 text-start bg-gray-50">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="accent-black w-4 h-4 cursor-pointer"
              />
            </th>
            {tableHeaders.map((h) => (
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
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="border-b border-gray-100 bg-white">
                <td className="w-9 px-3 py-4">
                  <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
                </td>
                {Array.from({ length: colSpan - 1 }).map((_, cIdx) => (
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
              <td colSpan={colSpan} className="text-center py-16 text-gray-400">
                {activeTab === 'pending' ? (
                  /* ── "No Pending Requests" empty state ── */
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                      <i className="ti ti-mail text-2xl text-gray-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-700 mb-1">
                        {t('vendors.table.noPendingRequests')}
                      </p>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">
                        {t('vendors.table.noPendingSubtext')}
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw size={14} />
                      {t('vendors.table.refresh')}
                    </button>
                  </div>
                ) : (
                  /* ── Generic empty state ── */
                  <div className="flex flex-col items-center gap-2">
                    <i className="ti ti-building-store text-2xl block" aria-hidden="true" />
                    <p>{t('vendors.table.noVendors')}</p>
                  </div>
                )}
              </td>
            </tr>
          ) : isAllTab ? (
            // ── All Vendors: approved only with toggle, rows navigate to detail ──
            paginated.map((vendor) => {
              const isSelected = selectedRows.includes(vendor.id);
              return (
                <tr
                  key={vendor.id}
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                  className={`border-b border-gray-100 transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-50/60' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <td
                    className="px-3 py-3.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(vendor.id)}
                      className="accent-black w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {vendor.businessName}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.owner}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {(vendor.revenue ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {vendor.submittedDate}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.email}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.orders ?? 0}
                  </td>
                  <td
                    className="px-4 py-3.5 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Toggle
                      checked={vendor.active ?? true}
                      onChange={() => {
                        if (vendor.active) {
                          openConfirm('deactivate', [vendor.id], vendor.businessName);
                        } else {
                          openConfirm('reactivate', [vendor.id], vendor.businessName);
                        }
                      }}
                    />
                  </td>
                </tr>
              );
            })
          ) : (
            // ── Pending: original columns ──
            paginated.map((vendor) => {
              const isSelected = selectedRows.includes(vendor.id);
              return (
                <tr
                  key={vendor.id}
                  className={`border-b border-gray-100 transition-colors ${
                    isSelected ? 'bg-indigo-50/60' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(vendor.id)}
                      className="accent-black w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                      className="font-medium text-gray-900 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors text-start"
                    >
                      {vendor.businessName}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.owner}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.email}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {vendor.submittedDate}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.category}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {vendor.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            openConfirm('approve', [vendor.id], vendor.businessName)
                          }
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1e8528] text-white hover:bg-green-800 transition-colors shadow-2xs"
                        >
                          {t('vendors.table.approve')}
                        </button>
                        <button
                          onClick={() =>
                            openConfirm('reject', [vendor.id], vendor.businessName)
                          }
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 transition-colors shadow-2xs"
                        >
                          {t('vendors.table.reject')}
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        {t('vendors.table.suspendedStatus')}
                      </span>
                    )}
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
