import { useState, useEffect, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Search } from 'lucide-react';
import { useBuyerStore } from '../store/buyerStore';
import { useAdminBuyers, useUpdateBuyerStatus } from '../hooks/useBuyers';
import { updateBuyerStatus } from '../../../services/buyers';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import BuyerDesktopTable from './BuyerDesktopTable';
import BuyerMobileList from './BuyerMobileList';
import BuyerPagination from './BuyerPagination';
import BuyerBulkActionBar from './BuyerBulkActionBar';
import ActivateBuyerModal from '../modals/ActivateBuyerModal';
import SuspendBuyerModal from '../modals/SuspendBuyerModal';
import BuyerConfirmModal from '../modals/BuyerConfirmModal';
import PortalDropdown from '../../../components/ui/PortalDropdown';
import type { Buyer } from '../types/buyers';

export default function BuyerTable() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const search = useBuyerStore((s) => s.search);
  const statusFilter = useBuyerStore((s) => s.statusFilter);
  const page = useBuyerStore((s) => s.page);
  const pageSize = useBuyerStore((s) => s.pageSize);
  const selectedRows = useBuyerStore((s) => s.selectedRows);

  const setSearch = useBuyerStore((s) => s.setSearch);
  const setStatusFilter = useBuyerStore((s) => s.setStatusFilter);
  const setPage = useBuyerStore((s) => s.setPage);
  const setBuyers = useBuyerStore((s) => s.setBuyers);
  const suspendBuyer = useBuyerStore((s) => s.suspendBuyer);
  const activateBuyer = useBuyerStore((s) => s.activateBuyer);
  const bulkActivate = useBuyerStore((s) => s.bulkActivate);
  const bulkSuspend = useBuyerStore((s) => s.bulkSuspend);
  const toggleRow = useBuyerStore((s) => s.toggleRow);
  const setSelectedRows = useBuyerStore((s) => s.setSelectedRows);
  const clearSelection = useBuyerStore((s) => s.clearSelection);

  // ── React Query hook fetching from /api/v1/admin/buyers ─────────────────
  const { data, isLoading, isFetching } = useAdminBuyers({
    pageNum: page,
    pageSize,
    status: statusFilter === 'all' ? undefined : statusFilter,
    search,
  });

  const paginated = data?.items || [];
  const pagination = data?.pagination || {
    currentPage: page,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  };

  useEffect(() => {
    if (data?.items) {
      setBuyers(data.items);
    }
  }, [data?.items, setBuyers]);

  const totalItems = pagination.totalItems;
  const totalPages = pagination.totalPages;

  const paginatedIds = paginated.map((b) => b.id);
  const allChecked =
    paginated.length > 0 && paginatedIds.every((id) => selectedRows.includes(id));
  const selectedCount = selectedRows.length;

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
    ids: string[];
  }>({ isOpen: false, type: 'activate', ids: [] });

  const queryClient = useQueryClient();
  const updateStatusMutation = useUpdateBuyerStatus();

  const toggleAll = (e: ChangeEvent<HTMLInputElement>) =>
    setSelectedRows(e.target.checked ? paginatedIds : []);

  const handleToggleStatus = (buyer: Buyer) => {
    const isActive = (buyer.status || '').toUpperCase() === 'ACTIVE';
    if (isActive) {
      setSuspendModal({ isOpen: true, buyer });
    } else {
      setActivateModal({ isOpen: true, buyer });
    }
  };

  const handleActivateConfirm = async () => {
    if (activateModal.buyer) {
      const buyerId = activateModal.buyer.id;
      try {
        await updateStatusMutation.mutateAsync({ id: buyerId, status: 'ACTIVE' });
        activateBuyer(buyerId);
        setActivateModal({ isOpen: false, buyer: null });
      } catch {
        // Error toast handled by mutation hook
      }
    }
  };

  const handleSuspendConfirm = async () => {
    if (suspendModal.buyer) {
      const buyerId = suspendModal.buyer.id;
      try {
        await updateStatusMutation.mutateAsync({ id: buyerId, status: 'DEACTIVATED' });
        suspendBuyer(buyerId);
        setSuspendModal({ isOpen: false, buyer: null });
      } catch {
        // Error toast handled by mutation hook
      }
    }
  };

  const handleBulkActivateConfirm = async () => {
    const ids = bulkConfirmModal.ids;
    setBulkConfirmModal({ isOpen: false, type: 'activate', ids: [] });
    try {
      await Promise.all(ids.map((id) => updateBuyerStatus(id, 'ACTIVE')));
      bulkActivate(ids);
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] });
      toast.success('Selected buyers activated successfully');
    } catch {
      toast.error('Failed to activate selected buyers');
    }
  };

  const handleBulkSuspendConfirm = async () => {
    const ids = bulkConfirmModal.ids;
    setBulkConfirmModal({ isOpen: false, type: 'suspend', ids: [] });
    try {
      await Promise.all(ids.map((id) => updateBuyerStatus(id, 'DEACTIVATED')));
      bulkSuspend(ids, undefined);
      queryClient.invalidateQueries({ queryKey: ['admin-buyers'] });
      toast.success('Selected buyers deactivated successfully');
    } catch {
      toast.error('Failed to deactivate selected buyers');
    }
  };

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: t('buyers.table.statusAll', 'Status: All') },
    { value: 'ACTIVE', label: t('buyers.table.statusActive', 'Active') },
    {
      value: 'PENDING_VERIFICATION',
      label: t('buyers.table.statusPendingVerification', 'Pending Verification'),
    },
    { value: 'LOCKED', label: t('buyers.table.statusLocked', 'Locked') },
    { value: 'DEACTIVATED', label: t('buyers.table.statusDeactivated', 'Deactivated') },
  ];

  const activeFilterLabel =
    statusOptions.find((f) => f.value === statusFilter)?.label ??
    t('buyers.table.statusFilter', 'Status');

  return (
    <div className="font-sans text-gray-800" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Filters (Search & Status Dropdown) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 mb-5 w-full">
        {/* Search */}
        <div className="flex items-center gap-2.5 border border-gray-200/90 rounded-2xl sm:rounded-lg px-4 py-2.5 bg-white flex-1 sm:max-w-xs shadow-2xs transition-colors focus-within:border-gray-400">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={t('buyers.table.search', 'Search name, email, or phone...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full placeholder:text-gray-400 font-normal"
          />
        </div>

        {/* Status Selector Dropdown */}
        <PortalDropdown
          minWidth={180}
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
                className={`text-gray-500 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
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
        isPending={updateStatusMutation.isPending}
        onConfirm={handleActivateConfirm}
        onCancel={() => setActivateModal({ isOpen: false, buyer: null })}
      />

      {/* Suspend Modal */}
      <SuspendBuyerModal
        isOpen={suspendModal.isOpen}
        buyerName={suspendModal.buyer?.name ?? ''}
        isPending={updateStatusMutation.isPending}
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
