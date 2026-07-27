import { useState, useEffect, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search } from 'lucide-react';
import { useBuyerStore, useBuyerTable } from '../store/buyerStore';
import BuyerDesktopTable from './BuyerDesktopTable';
import BuyerMobileList from './BuyerMobileList';
import BuyerPagination from './BuyerPagination';
import BuyerBulkActionBar from './BuyerBulkActionBar';
import ActivateBuyerModal from '../modals/ActivateBuyerModal';
import SuspendBuyerModal from '../modals/SuspendBuyerModal';
import BuyerConfirmModal from '../modals/BuyerConfirmModal';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import type { Buyer, BuyerStatus } from '../types/buyers';

export default function BuyerTable() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const search = useBuyerStore((s) => s.search);
  const statusFilter = useBuyerStore((s) => s.statusFilter);
  const setSearch = useBuyerStore((s) => s.setSearch);
  const setStatusFilter = useBuyerStore((s) => s.setStatusFilter);
  const setPage = useBuyerStore((s) => s.setPage);
  const suspendBuyer = useBuyerStore((s) => s.suspendBuyer);
  const activateBuyer = useBuyerStore((s) => s.activateBuyer);
  const bulkActivate = useBuyerStore((s) => s.bulkActivate);
  const bulkSuspend = useBuyerStore((s) => s.bulkSuspend);
  const toggleRow = useBuyerStore((s) => s.toggleRow);
  const setSelectedRows = useBuyerStore((s) => s.setSelectedRows);
  const clearSelection = useBuyerStore((s) => s.clearSelection);

  const {
    paginated,
    totalItems,
    totalPages,
    page,
    itemsPerPage,
    selectedRows,
    selectedCount,
    allChecked,
    paginatedIds,
  } = useBuyerTable();

  // ── Skeleton loading on filter/page change ───────────────────────────────
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [page, statusFilter, search]);

  // ── Individual action modals ─────────────────────────────────────────────
  const [activateModal, setActivateModal] = useState<{
    isOpen: boolean;
    buyer: Buyer | null;
  }>({ isOpen: false, buyer: null });

  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    buyer: Buyer | null;
  }>({ isOpen: false, buyer: null });

  // ── Bulk confirm modal ───────────────────────────────────────────────────
  const [bulkConfirmModal, setBulkConfirmModal] = useState<{
    isOpen: boolean;
    type: 'activate' | 'suspend';
    ids: number[];
  }>({ isOpen: false, type: 'activate', ids: [] });

  const toggleAll = (e: ChangeEvent<HTMLInputElement>) =>
    setSelectedRows(e.target.checked ? paginatedIds : []);

  const handleToggleStatus = (buyer: Buyer) => {
    if (buyer.status === 'active') {
      setSuspendModal({ isOpen: true, buyer });
    } else {
      setActivateModal({ isOpen: true, buyer });
    }
  };

  const handleActivateConfirm = () => {
    if (activateModal.buyer) {
      activateBuyer(activateModal.buyer.id);
    }
    setActivateModal({ isOpen: false, buyer: null });
  };

  const handleSuspendConfirm = (reason: string) => {
    if (suspendModal.buyer) {
      suspendBuyer(suspendModal.buyer.id, reason);
    }
    setSuspendModal({ isOpen: false, buyer: null });
  };

  const handleBulkActivateConfirm = () => {
    bulkActivate(bulkConfirmModal.ids);
    setBulkConfirmModal({ isOpen: false, type: 'activate', ids: [] });
  };

  const handleBulkSuspendConfirm = () => {
    bulkSuspend(bulkConfirmModal.ids);
    setBulkConfirmModal({ isOpen: false, type: 'suspend', ids: [] });
  };

  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  const statusOptions: { value: BuyerStatus | 'all'; label: string }[] = [
    { value: 'all', label: t('buyers.table.statusAll', 'Status: All') },
    { value: 'active', label: t('buyers.table.statusActive', 'Active') },
    { value: 'suspended', label: t('buyers.table.statusSuspended', 'Suspended') },
  ];

  const activeFilterLabel =
    statusOptions.find((f) => f.value === statusFilter)?.label ?? t('buyers.table.statusFilter', 'Status');

  return (
    <div className="font-sans text-gray-800" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Filters (Matching Image 1 layout with larger search bar on mobile) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5 w-full">
        {/* Search */}
        <div className="flex items-center gap-2.5 border border-gray-200/90 rounded-2xl sm:rounded-lg px-4 py-2.5 bg-white flex-1 sm:max-w-xs shadow-2xs transition-colors focus-within:border-gray-400">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={t('buyers.table.search', 'Search name or email...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full placeholder:text-gray-400 font-normal"
          />
        </div>

        {/* PortalDropdown Status Selector */}
        <PortalDropdown
          minWidth={160}
          animate={false}
          menuClassName="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 py-1"
          trigger={({ isOpen, toggle }) => (
            <button
              type="button"
              className="flex items-center justify-between sm:justify-start gap-1.5 h-12 sm:h-9 px-4 border border-gray-200/90 rounded-2xl sm:rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap shadow-2xs w-full sm:w-auto"
              onClick={toggle}
            >
              <span className="font-medium text-gray-700">
                {statusFilter === 'all'
                  ? t('buyers.table.statusAll', 'Status: All')
                  : activeFilterLabel}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        >
          {({ close }) => (
            <>
              {statusOptions.map((f) => (
                <div
                  key={f.value}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setStatusFilter(f.value);
                    close();
                  }}
                >
                  <input
                    type="radio"
                    readOnly
                    checked={statusFilter === f.value}
                    className="accent-black w-3.5 h-3.5 cursor-pointer"
                  />
                  <span className="font-medium text-gray-700">{f.label}</span>
                </div>
              ))}
            </>
          )}
        </PortalDropdown>
      </div>

      {/* Desktop Table */}
      <BuyerDesktopTable
        paginated={paginated}
        isLoading={isLoading}
        allChecked={allChecked}
        toggleAll={toggleAll}
        selectedRows={selectedRows}
        toggleRow={toggleRow}
        onToggleStatus={handleToggleStatus}
      />

      {/* Mobile List */}
      <BuyerMobileList
        paginated={paginated}
        isLoading={isLoading}
        allChecked={allChecked}
        toggleAll={toggleAll}
        selectedCount={selectedCount}
        selectedRows={selectedRows}
        toggleRow={toggleRow}
        onToggleStatus={handleToggleStatus}
      />

      {/* Pagination */}
      <BuyerPagination
        startItem={startItem}
        endItem={endItem}
        totalItems={totalItems}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        isRtl={isRtl}
      />

      {/* Bulk Action Bar */}
      <BuyerBulkActionBar
        selectedCount={selectedCount}
        selectedRows={selectedRows}
        onBulkActivate={() =>
          setBulkConfirmModal({ isOpen: true, type: 'activate', ids: selectedRows })
        }
        onBulkSuspend={() =>
          setBulkConfirmModal({ isOpen: true, type: 'suspend', ids: selectedRows })
        }
        clearSelection={clearSelection}
      />

      {/* Activate Modal */}
      <ActivateBuyerModal
        isOpen={activateModal.isOpen}
        buyerName={activateModal.buyer?.name ?? ''}
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateModal({ isOpen: false, buyer: null })}
      />

      {/* Suspend Modal */}
      <SuspendBuyerModal
        isOpen={suspendModal.isOpen}
        buyerName={suspendModal.buyer?.name ?? ''}
        onConfirm={handleSuspendConfirm}
        onCancel={() => setSuspendModal({ isOpen: false, buyer: null })}
      />

      {/* Bulk Confirm Modal */}
      <BuyerConfirmModal
        isOpen={bulkConfirmModal.isOpen}
        type={bulkConfirmModal.type}
        count={bulkConfirmModal.ids.length}
        onConfirm={
          bulkConfirmModal.type === 'activate'
            ? handleBulkActivateConfirm
            : handleBulkSuspendConfirm
        }
        onCancel={() => setBulkConfirmModal({ isOpen: false, type: 'activate', ids: [] })}
      />
    </div>
  );
}
