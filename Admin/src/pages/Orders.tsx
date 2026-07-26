import { useTranslation } from 'react-i18next';
import {
  OrderFilters,
  OrdersTable,
  Pagination,
  MobileOrderCard,
  EmptyState,
  OrdersSkeleton,
  useOrdersLogic,
} from '../features/Orders';

export default function Orders() {
  const { t } = useTranslation();

  const {
    activeMainTab,
    handleMainTabChange,
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    dateFilter,
    handleDateFilterChange,
    vendorFilter,
    handleVendorFilterChange,
    setPage,
    safePage,
    isLoading,
    isMobile,
    totalCount,
    totalPages,
    itemsPerPage,
    paginatedData,
    handleViewDetails,
  } = useOrdersLogic();

  return (
    <>
      {/* Header Container */}
      <div className="sidebar-page-container-header">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title">
              {activeMainTab === 'allOrders'
                ? t('ordersPage.title', 'Orders')
                : t('ordersPage.refunds', 'Refunds')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        {/* Modular Filter Controls */}
        <OrderFilters
          activeMainTab={activeMainTab}
          onMainTabChange={handleMainTabChange}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          vendorFilter={vendorFilter}
          onVendorFilterChange={handleVendorFilterChange}
        />

        {/* Content Views: Skeleton vs Mobile Cards vs Desktop Table */}
        {isLoading ? (
          <OrdersSkeleton isMobile={isMobile} />
        ) : isMobile ? (
          <div>
            {paginatedData.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <EmptyState />
              </div>
            ) : (
              <>
                {paginatedData.map((item) => (
                  <MobileOrderCard
                    key={item.id}
                    item={item}
                    type={activeMainTab}
                    onViewDetails={handleViewDetails}
                  />
                ))}
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setPage}
                  isMobile
                />
              </>
            )}
          </div>
        ) : (
          <div>
            <OrdersTable
              items={paginatedData}
              activeMainTab={activeMainTab}
              onViewDetails={handleViewDetails}
            />
            {totalCount > 0 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
