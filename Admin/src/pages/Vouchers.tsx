import { useMemo } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  VOUCHERS_PER_PAGE,
  useVoucherStore,
  useVouchersData,
  VoucherHeader,
  VoucherStatCards,
  VoucherFilterBar,
  VoucherTable,
  VoucherMobileList,
  VoucherDeleteModal,
  VoucherPagination,
} from '../features/vouchers';

const Vouchers = () => {
  const { isMobile } = useBreakpoint();

  // ── Query & Mutation Hook ──
  const { deleteMutation } = useVouchersData();

  // ── Store State ──
  const vouchers = useVoucherStore((s) => s.vouchers);
  const activeTab = useVoucherStore((s) => s.activeTab);
  const search = useVoucherStore((s) => s.search);
  const typeFilter = useVoucherStore((s) => s.typeFilter);
  const statusFilter = useVoucherStore((s) => s.statusFilter);
  const currentPage = useVoucherStore((s) => s.currentPage);
  const deleteModal = useVoucherStore((s) => s.deleteModal);

  // ── Store Actions ──
  const setCurrentPage = useVoucherStore((s) => s.setCurrentPage);
  const openDeleteModal = useVoucherStore((s) => s.openDeleteModal);
  const closeDeleteModal = useVoucherStore((s) => s.closeDeleteModal);

  // ── Stats Calculations ──
  const activeCount = useMemo(() => {
    return vouchers.filter((v) => v.status === 'Active').length;
  }, [vouchers]);

  // ── Unique Voucher Types ──
  const availableTypes = useMemo(() => {
    const list = Array.from(new Set(vouchers.map((v) => v.type))).filter(Boolean);
    return list.sort();
  }, [vouchers]);

  // ── Filter Logic ──
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((item) => {
      // Mobile Active/Expired/All Tab Filter
      if (activeTab === 'active' && item.status !== 'Active') return false;
      if (activeTab === 'expired' && item.status !== 'Expired') return false;

      // Search Query Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchCode = item.code.toLowerCase().includes(q);
        const matchType = item.type.toLowerCase().includes(q);
        if (!matchCode && !matchType) return false;
      }

      // Type Dropdown Filter
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;

      // Status Dropdown Filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      return true;
    });
  }, [vouchers, activeTab, search, typeFilter, statusFilter]);

  // ── Pagination Calculation ──
  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / VOUCHERS_PER_PAGE));
  const paginatedVouchers = useMemo(() => {
    const start = (currentPage - 1) * VOUCHERS_PER_PAGE;
    return filteredVouchers.slice(start, start + VOUCHERS_PER_PAGE);
  }, [filteredVouchers, currentPage]);

  // ── Confirm Delete Handler ──
  const handleConfirmDelete = () => {
    if (deleteModal.voucher) {
      deleteMutation.mutate(deleteModal.voucher.id || deleteModal.voucher.code);
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="sidebar-page-container-header">
        <VoucherHeader titleKey="vouchersListing.title" breadcrumbType="list" />
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 sidebar-page-container transition-all">
        {/* Summary Stat Cards */}
        <VoucherStatCards
          activeCount={activeCount}
          runningCount={vouchers.length}
        />

        {/* Search & Filter Controls */}
        <VoucherFilterBar
          availableTypes={availableTypes}
          activeCount={activeCount}
        />

        {/* Voucher List Content */}
        {isMobile ? (
          <div className="space-y-3">
            <VoucherMobileList
              vouchers={paginatedVouchers}
              onDeleteClick={openDeleteModal}
            />

            {filteredVouchers.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
                <VoucherPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredVouchers.length}
                  itemsPerPage={VOUCHERS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <VoucherTable
              vouchers={paginatedVouchers}
              onDeleteClick={openDeleteModal}
            />

            {filteredVouchers.length > 0 && (
              <VoucherPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredVouchers.length}
                itemsPerPage={VOUCHERS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <VoucherDeleteModal
          isOpen={deleteModal.open}
          voucher={deleteModal.voucher}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </>
  );
};

export default Vouchers;
