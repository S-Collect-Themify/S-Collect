import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Inbox, Star } from 'lucide-react';
import Toggle from '../../../components/ui/Toggle';
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
  toggleVendorActive?: (id: string) => void;
  toggleFeatureVendor?: (id: string, isFeatured: boolean) => void;
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
  toggleFeatureVendor,
  isLoading,
}: VendorDesktopTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="w-full overflow-x-auto hidden md:block">
      <table className="w-full border-collapse text-sm bg-white">
        <thead>
          <tr>
            <th className="w-9 px-3 py-3 border-b border-gray-200 text-start bg-gray-50">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                aria-label={t('vendors.table.selectAll', 'Select all vendors')}
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
                  <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#F5F5F6] flex items-center justify-center mb-5 text-gray-900 shadow-2xs">
                      <Inbox size={32} strokeWidth={1.5} className="text-gray-900" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-xl sm:text-2xl mb-2.5 tracking-tight">
                      {t('vendors.table.noPendingRequests', 'No Pending Requests')}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-700 max-w-sm mx-auto font-normal leading-relaxed">
                      {t('vendors.table.noPendingSubtext', 'All vendor applications have been reviewed. New requests will appear here.')}
                    </p>
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
                      aria-label={vendor.businessName || 'Vendor'}
                      className="accent-black w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {vendor.businessName || '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.owner || '----'}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {vendor.revenue != null ? vendor.revenue.toLocaleString() : '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                    {vendor.submittedDate || '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.email || '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.orders != null ? vendor.orders : '----'}
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
                  <td
                    className="px-4 py-3.5 whitespace-nowrap text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFeatureVendor?.(vendor.id, Boolean(vendor.isFeatured))}
                      title={vendor.isFeatured ? 'Unmark as featured' : 'Mark as featured'}
                      className="p-1.5 rounded-lg hover:bg-amber-50 transition-all cursor-pointer inline-flex items-center justify-center active:scale-90"
                    >
                      <Star
                        size={20}
                        fill={vendor.isFeatured ? '#fbbf24' : 'none'}
                        className={
                          vendor.isFeatured
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-amber-400 stroke-amber-400 fill-none hover:fill-amber-400/30'
                        }
                      />
                    </button>
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
                      aria-label={vendor.businessName || 'Vendor'}
                      className="accent-black w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/vendors/${vendor.id}`)}
                      className="font-medium text-gray-900 hover:text-indigo-600 hover:underline underline-offset-2 transition-colors text-start"
                    >
                      {vendor.businessName || '----'}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.owner || '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.email || '----'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">
                    {vendor.submittedDate || '----'}
                  </td>
                  {/* <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {vendor.category || '----'}
                  </td> */}
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
