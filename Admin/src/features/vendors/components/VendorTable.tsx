import { useState, Activity, type ChangeEvent } from 'react';
import { ChevronDown, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useVendorStore, useVendorTable } from '../store/vendorStore';
import {
  useVendors,
  useApproveVendor,
  useRejectVendor,
  useDeactivateVendor,
  useReactivateVendor,
  useFeatureVendor,
  useUnfeatureVendor,
} from '../hooks/useVendors';
import VendorCategoryDropdown from './VendorCategoryDropdown';
import VendorConfirmModal from '../modals/VendorConfirmModal';
import RejectVendorModal from '../modals/RejectVendorModal';
import DeactivateVendorModal from '../modals/DeactivateVendorModal';
import VendorDesktopTable from './VendorDesktopTable';
import VendorMobileList from './VendorMobileList';
import VendorPagination from './VendorPagination';
import VendorBulkActionBar from './VendorBulkActionBar';
import type { ActiveFilter, VendorTab } from '../types/vendors';
import PortalDropdown from '../../../components/ui/PortalDropdown';

export default function VendorTable() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const activeTab = useVendorStore((s) => s.activeTab);
  const search = useVendorStore((s) => s.search);
  const selectedCategory = useVendorStore((s) => s.selectedCategory);
  const activeFilter = useVendorStore((s) => s.activeFilter);
  const setActiveTab = useVendorStore((s) => s.setActiveTab);
  const setSearch = useVendorStore((s) => s.setSearch);
  const setSelectedCategory = useVendorStore((s) => s.setSelectedCategory);
  const setActiveFilter = useVendorStore((s) => s.setActiveFilter);
  const setPage = useVendorStore((s) => s.setPage);
  const toggleRow = useVendorStore((s) => s.toggleRow);
  const setSelectedRows = useVendorStore((s) => s.setSelectedRows);
  const clearSelection = useVendorStore((s) => s.clearSelection);

  // Status query parameter: PENDING_APPROVAL for pending tab, filter value for all tab
  const statusParam =
    activeTab === 'pending'
      ? 'PENDING_APPROVAL'
      : activeFilter === 'active'
      ? 'ACTIVE'
      : activeFilter === 'inactive'
      ? 'DEACTIVATED'
      : undefined;

  const { data: fetchedVendors = [], isLoading, isFetching, refetch } = useVendors({
    status: statusParam,
    search: search.trim() || undefined,
  });

  const approveMutation = useApproveVendor();
  const rejectMutation = useRejectVendor();
  const deactivateMutation = useDeactivateVendor();
  const reactivateMutation = useReactivateVendor();
  const featureMutation = useFeatureVendor();
  const unfeatureMutation = useUnfeatureVendor();

  const handleToggleVendorActive = (id: string) => {
    const vendor = fetchedVendors.find((v) => v.id === id);
    if (vendor?.active) {
      deactivateMutation.mutate(id);
    } else {
      reactivateMutation.mutate(id);
    }
  };

  const handleToggleFeatureVendor = (id: string, isCurrentlyFeatured: boolean) => {
    const vendor = fetchedVendors.find((v) => v.id === id);
    const vName = vendor?.businessName || '';
    if (isCurrentlyFeatured) {
      openConfirm('unfeature', [id], vName);
    } else {
      openConfirm('feature', [id], vName);
    }
  };

  const {
    paginated,
    totalItems,
    totalPages,
    page,
    itemsPerPage,
    pendingCount,
    selectedRows,
    selectedCount,
    allChecked,
    paginatedIds,
  } = useVendorTable(fetchedVendors);

  type ModalType = 'approve' | 'reject' | 'deactivate' | 'reactivate' | 'feature' | 'unfeature';
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    ids: string[];
    vendorName?: string;
  }>({ isOpen: false, type: 'approve', ids: [] });

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    ids: string[];
    vendorName: string;
  }>({ isOpen: false, ids: [], vendorName: '' });

  const [suspendModal, setSuspendModal] = useState<{
    isOpen: boolean;
    ids: string[];
    vendorName: string;
  }>({ isOpen: false, ids: [], vendorName: '' });

  const tabs: { key: VendorTab; label: string; count?: number }[] = [
    { key: 'pending', label: t('vendors.tabs.pending'), count: pendingCount },
    { key: 'all', label: t('vendors.tabs.all') },
  ];

  const activeFilters: { key: ActiveFilter; label: string }[] = [
    { key: 'all', label: t('vendors.table.allStatuses') },
    { key: 'active', label: t('vendors.table.active') },
    { key: 'inactive', label: t('vendors.table.inactive') },
  ];

  const isAllTab = activeTab === 'all';

  const pendingSuspendedHeaders = [
    t('vendors.table.businessName'),
    t('vendors.table.owner'),
    t('vendors.table.email'),
    t('vendors.table.submittedDate'),
    t('vendors.table.category'),
    t('vendors.table.actions'),
  ];

  const allVendorHeaders = [
    t('vendors.table.vendorName'),
    t('vendors.table.owner'),
    t('vendors.table.revenue'),
    t('vendors.table.submittedDate'),
    t('vendors.table.email'),
    t('vendors.table.orders'),
    t('vendors.table.status'),
    t('vendors.table.assign', 'Assign'),
  ];

  const tableHeaders = isAllTab ? allVendorHeaders : pendingSuspendedHeaders;
  const colSpan = tableHeaders.length + 1;

  const startItem = totalItems === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  const activeFilterLabel =
    activeFilters.find((f) => f.key === activeFilter)?.label ??
    t('vendors.table.statusFilter');

  const toggleAll = (e: ChangeEvent<HTMLInputElement>) =>
    setSelectedRows(e.target.checked ? paginatedIds : []);

  const selectedVendors = fetchedVendors.filter((v) => selectedRows.includes(v.id));

  const openConfirm = (type: ModalType, ids: string[], vendorName?: string) => {
    let targetIds = ids;
    if (type === 'deactivate') {
      targetIds = ids.filter((id) => {
        const v = fetchedVendors.find((item) => item.id === id);
        return v ? v.active : true;
      });
    } else if (type === 'reactivate') {
      targetIds = ids.filter((id) => {
        const v = fetchedVendors.find((item) => item.id === id);
        return v ? !v.active : true;
      });
    }

    if (targetIds.length === 0) return;

    const vName =
      vendorName && ids.length === 1
        ? vendorName
        : targetIds.length === 1
        ? fetchedVendors.find((v) => v.id === targetIds[0])?.businessName
        : `${targetIds.length} Vendors`;

    if (type === 'reject') {
      setRejectModal({
        isOpen: true,
        ids: targetIds,
        vendorName: vName ?? '',
      });
    } else if (type === 'deactivate') {
      setSuspendModal({
        isOpen: true,
        ids: targetIds,
        vendorName: vName ?? '',
      });
    } else {
      setConfirmModal({
        isOpen: true,
        type,
        ids: targetIds,
        vendorName: vName ?? '',
      });
    }
  };

  const handleConfirmReject = (reason: string) => {
    rejectModal.ids.forEach((id) => {
      rejectMutation.mutate({ id, reason });
    });
    clearSelection();
    setRejectModal({ isOpen: false, ids: [], vendorName: '' });
  };

  const handleConfirmSuspend = (reason: string) => {
    suspendModal.ids.forEach((id) => {
      deactivateMutation.mutate({ id, reason });
    });
    clearSelection();
    setSuspendModal({ isOpen: false, ids: [], vendorName: '' });
  };

  const handleConfirm = (reason?: string) => {
    const { type, ids } = confirmModal;
    if (type === 'approve') {
      ids.forEach((id) => {
        approveMutation.mutate(id);
      });
      clearSelection();
    } else if (type === 'reactivate') {
      ids.forEach((id) => {
        reactivateMutation.mutate(id);
      });
      clearSelection();
    } else if (type === 'deactivate') {
      ids.forEach((id) => {
        deactivateMutation.mutate({ id, reason });
      });
      clearSelection();
    } else if (type === 'feature') {
      ids.forEach((id) => {
        featureMutation.mutate(id);
      });
      clearSelection();
    } else if (type === 'unfeature') {
      ids.forEach((id) => {
        unfeatureMutation.mutate(id);
      });
      clearSelection();
    }
    setConfirmModal({ isOpen: false, type: 'approve', ids: [] });
  };

  const handleCancel = () =>
    setConfirmModal({ isOpen: false, type: 'approve', ids: [] });

  return (
    <div className="font-sans text-gray-800" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-semibold ${
                  activeTab === tab.key
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2.5 mb-5 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 bg-white h-9 flex-1 max-w-50">
          <i className="ti ti-search text-gray-400 text-base" aria-hidden="true" />
          <input
            type="text"
            placeholder={t('vendors.table.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm w-full placeholder:text-gray-400"
          />
        </div>

        {/* Category filter — only for non-all tabs */}
        {!isAllTab && (
          <VendorCategoryDropdown
            selected={selectedCategory}
            onChange={setSelectedCategory}
          />
        )}

        {/* Status filter — only for All Vendors tab */}
        {isAllTab && (
          <PortalDropdown
            minWidth={150}
            animate={false}
            menuClassName="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
            trigger={({ isOpen, toggle }) => (
              <button
                className="flex items-center gap-1.5 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm cursor-pointer hover:bg-gray-50 whitespace-nowrap"
                onClick={toggle}
              >
                <span className="font-medium">{t('vendors.table.statusFilter')}</span>
                {activeFilter !== 'all' && (
                  <span className="text-xs text-indigo-600 font-semibold">
                    · {activeFilterLabel}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  color="black"
                  className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          >
            {({ close }) => (
              <>
                {activeFilters.map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setActiveFilter(f.key);
                      close();
                    }}
                  >
                    <input
                      type="radio"
                      readOnly
                      checked={activeFilter === f.key}
                      className="accent-black w-3.5 h-3.5"
                    />
                    <span>{f.label}</span>
                  </div>
                ))}
              </>
            )}
          </PortalDropdown>
        )}

        {/* Refetch Data Button — Pending requests tab only */}
        {!isAllTab && (
          <div className="ms-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              title={t('vendors.table.refresh', 'Refresh Data')}
              className="flex items-center gap-2 h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCw
                size={15}
                className={`text-gray-600 ${isFetching ? 'animate-spin' : ''}`}
              />
              <span>{t('vendors.table.refresh', 'Refresh')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Panels wrapped with React 19 Activity component */}
      <Activity mode={activeTab === 'pending' ? 'visible' : 'hidden'}>
        <VendorDesktopTable
          paginated={paginated}
          tableHeaders={tableHeaders}
          colSpan={colSpan}
          allChecked={allChecked}
          toggleAll={toggleAll}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          activeTab={activeTab}
          isAllTab={isAllTab}
          openConfirm={openConfirm}
          toggleVendorActive={handleToggleVendorActive}
          isLoading={isLoading}
        />
        <VendorMobileList
          paginated={paginated}
          allChecked={allChecked}
          toggleAll={toggleAll}
          selectedCount={selectedCount}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          activeTab={activeTab}
          openConfirm={openConfirm}
          toggleVendorActive={handleToggleVendorActive}
          isLoading={isLoading}
        />
      </Activity>

      <Activity mode={activeTab === 'all' ? 'visible' : 'hidden'}>
        <VendorDesktopTable
          paginated={paginated}
          tableHeaders={tableHeaders}
          colSpan={colSpan}
          allChecked={allChecked}
          toggleAll={toggleAll}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          activeTab={activeTab}
          isAllTab={isAllTab}
          openConfirm={openConfirm}
          toggleVendorActive={handleToggleVendorActive}
          toggleFeatureVendor={handleToggleFeatureVendor}
          isLoading={isLoading}
        />
        <VendorMobileList
          paginated={paginated}
          allChecked={allChecked}
          toggleAll={toggleAll}
          selectedCount={selectedCount}
          selectedRows={selectedRows}
          toggleRow={toggleRow}
          activeTab={activeTab}
          openConfirm={openConfirm}
          toggleVendorActive={handleToggleVendorActive}
          toggleFeatureVendor={handleToggleFeatureVendor}
          isLoading={isLoading}
        />
      </Activity>

      {/* Pagination */}
      <VendorPagination
        startItem={startItem}
        endItem={endItem}
        totalItems={totalItems}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
        isRtl={isRtl}
      />

      {/* Bulk Action Bar */}
      <VendorBulkActionBar
        selectedCount={selectedCount}
        selectedRows={selectedRows}
        selectedVendors={selectedVendors}
        activeTab={activeTab}
        openConfirm={openConfirm}
        clearSelection={clearSelection}
      />

      {/* Confirmation modal */}
      <VendorConfirmModal
        isOpen={confirmModal.isOpen}
        type={confirmModal.type}
        count={confirmModal.ids.length}
        vendorName={confirmModal.vendorName}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* Reject Vendor Modal */}
      <RejectVendorModal
        isOpen={rejectModal.isOpen}
        vendorName={rejectModal.vendorName}
        onConfirm={handleConfirmReject}
        onCancel={() => setRejectModal({ isOpen: false, ids: [], vendorName: '' })}
      />

      {/* Deactivate Vendor Modal */}
      <DeactivateVendorModal
        isOpen={suspendModal.isOpen}
        vendorName={suspendModal.vendorName}
        onConfirm={handleConfirmSuspend}
        onCancel={() => setSuspendModal({ isOpen: false, ids: [], vendorName: '' })}
      />
    </div>
  );
}
