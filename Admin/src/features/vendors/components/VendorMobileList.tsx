import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Toggle from '../../mangement/Toggle';
import type { Vendor, VendorTab } from '../types/vendors';

type ModalType = 'approve' | 'reject' | 'deactivate' | 'reactivate';

interface VendorMobileListProps {
  paginated: Vendor[];
  allChecked: boolean;
  toggleAll: (e: ChangeEvent<HTMLInputElement>) => void;
  selectedCount: number;
  selectedRows: string[];
  toggleRow: (id: string) => void;
  activeTab: VendorTab;
  openConfirm: (type: ModalType, ids: string[], vendorName?: string) => void;
  toggleVendorActive?: (id: string) => void;
  isLoading?: boolean;
}

export default function VendorMobileList({
  paginated,
  allChecked,
  toggleAll,
  selectedCount,
  selectedRows,
  toggleRow,
  activeTab,
  openConfirm,
  isLoading,
}: VendorMobileListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Select All Bar */}
      {paginated.length > 0 && !isLoading && (
        <div className="md:hidden flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-3.5 shadow-2xs">
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
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {selectedCount} selected
            </span>
          )}
        </div>
      )}

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-3.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="w-32 h-4 rounded bg-gray-200 animate-pulse" />
                <div className="w-14 h-5 rounded-full bg-gray-200 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="w-24 h-3.5 rounded bg-gray-100 animate-pulse" />
                <div className="w-20 h-3.5 rounded bg-gray-100 animate-pulse" />
                <div className="w-28 h-3.5 rounded bg-gray-100 animate-pulse" />
                <div className="w-16 h-3.5 rounded bg-gray-100 animate-pulse" />
              </div>
            </div>
          ))
        ) : paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            {activeTab === 'pending' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="ti ti-mail text-xl text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-700">
                  {t('vendors.table.noPendingRequests')}
                </p>
              </div>
            ) : (
              <p>{t('vendors.table.noVendors')}</p>
            )}
          </div>
        ) : (
          paginated.map((vendor) => {
            const isSelected = selectedRows.includes(vendor.id);
            if (activeTab === 'pending') {
              return (
                <div
                  key={vendor.id}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 transition-colors ${
                    isSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100'
                  }`}
                >
                  {/* Top row: Business Name + Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(vendor.id)}
                        className="accent-black w-4 h-4 cursor-pointer rounded mt-0.5"
                      />
                      <button
                        onClick={() => navigate(`/vendors/${vendor.id}`)}
                        className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors text-start"
                      >
                        {vendor.businessName}
                      </button>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 shrink-0">
                      {vendor.category}
                    </span>
                  </div>

                  {/* Middle details stack */}
                  <div className="space-y-1 text-xs text-gray-500 pt-1">
                    <p>
                      {t('vendors.mobile.owner', 'Owner')}: <span className="font-semibold text-gray-800 ms-1">{vendor.owner}</span>
                    </p>
                    <p>
                      {t('vendors.mobile.email', 'Email')}: <span className="font-semibold text-gray-800 ms-1">{vendor.email}</span>
                    </p>
                    <p>
                      {t('vendors.mobile.submitted', 'Submitted')}: <span className="font-semibold text-gray-800 ms-1">{vendor.submittedDate}</span>
                    </p>
                  </div>

                  {/* Bottom action buttons */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      onClick={() => openConfirm('approve', [vendor.id], vendor.businessName)}
                      className="flex-1 py-2.5 rounded-lg bg-[#1e8528] text-white text-xs font-semibold hover:bg-green-800 transition-colors shadow-2xs"
                    >
                      {t('vendors.table.approve')}
                    </button>
                    <button
                      onClick={() => openConfirm('reject', [vendor.id], vendor.businessName)}
                      className="flex-1 py-2.5 rounded-lg border border-red-300 text-red-700 bg-white text-xs font-semibold hover:bg-red-50 transition-colors shadow-2xs"
                    >
                      {t('vendors.table.reject')}
                    </button>
                  </div>
                </div>
              );
            } else {
              // All Vendors tab
              return (
                <div
                  key={vendor.id}
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                  className={`bg-white rounded-2xl border p-4 shadow-2xs space-y-3 cursor-pointer hover:bg-gray-50/60 transition-colors ${
                    isSelected ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(vendor.id)}
                        className="accent-black w-4 h-4 cursor-pointer rounded"
                      />
                      <span className="text-base font-bold text-gray-900">{vendor.businessName}</span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Toggle
                        checked={vendor.active ?? true}
                        onChange={() => {
                          if (vendor.active) openConfirm('deactivate', [vendor.id], vendor.businessName);
                          else openConfirm('reactivate', [vendor.id], vendor.businessName);
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 pt-1">
                    <p>{t('vendors.mobile.owner', 'Owner')}: <span className="font-semibold text-gray-800">{vendor.owner}</span></p>
                    <p>{t('vendors.mobile.submitted', 'Submitted')}: <span className="font-semibold text-gray-800">{vendor.submittedDate}</span></p>
                    <p>{t('vendors.mobile.email', 'Email')}: <span className="font-semibold text-gray-800 truncate block">{vendor.email}</span></p>
                    <p>{t('vendors.mobile.orders', 'Orders')}: <span className="font-semibold text-gray-800">{vendor.orders ?? 0}</span></p>
                    <p className="col-span-2">
                      {t('vendors.mobile.revenue', 'Revenue')}: <span className="font-bold text-gray-900">SAR {(vendor.revenue ?? 0).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>
    </>
  );
}
