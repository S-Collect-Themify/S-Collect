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
    search,
    handleSearchChange,
    statusFilter,
    handleStatusFilterChange,
    dateFilter,
    handleDateFilterChange,
    customRange,
    handleApplyCustomDate,
    buyerAccountIdFilter,
    handleBuyerFilterChange,
    setPage,
    safePage,
    isLoading,
    isMobile,
    itemsPerPage,
    displayOrders,
    ordersTotalCount,
    ordersTotalPages,
    isVendorFiltered,
    handleViewDetails,
  } = useOrdersLogic();

  return (
    <>
      {/* Header Container */}
      <div className="sidebar-page-container-header">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-bold text-gray-900 heading-page-title">
              {t('ordersPage.title', 'Orders')}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-page-container">
        {/* Modular Filter Controls */}
        <OrderFilters
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          dateFilter={dateFilter}
          onDateFilterChange={handleDateFilterChange}
          customFrom={customRange.dateFrom}
          customTo={customRange.dateTo}
          onApplyCustomDate={handleApplyCustomDate}
          buyerAccountId={buyerAccountIdFilter}
          onBuyerAccountIdChange={handleBuyerFilterChange}
        />

        {/* Content Views: Skeleton vs Mobile Cards vs Desktop Table */}
        {isLoading ? (
          <OrdersSkeleton isMobile={isMobile} />
        ) : isMobile ? (
          <div>
            {displayOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <EmptyState />
              </div>
            ) : (
              <>
                {displayOrders.map((item) => (
                  <MobileOrderCard
                    key={item.id}
                    item={item}
                    type="allOrders"
                    onViewDetails={handleViewDetails}
                    isVendorFiltered={isVendorFiltered}
                  />
                ))}
                <Pagination
                  currentPage={safePage}
                  totalPages={ordersTotalPages}
                  totalItems={ordersTotalCount}
                  itemsPerPage={itemsPerPage}
                  displayedCount={displayOrders.length}
                  onPageChange={setPage}
                  isMobile
                />
              </>
            )}
          </div>
        ) : (
          <div>
            <OrdersTable
              items={displayOrders}
              activeMainTab="allOrders"
              onViewDetails={handleViewDetails}
              isVendorFiltered={isVendorFiltered}
            />
            {ordersTotalCount > 0 && (
              <Pagination
                currentPage={safePage}
                totalPages={ordersTotalPages}
                totalItems={ordersTotalCount}
                itemsPerPage={itemsPerPage}
                displayedCount={displayOrders.length}
                onPageChange={setPage}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
