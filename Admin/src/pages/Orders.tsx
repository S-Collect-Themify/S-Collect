import { Activity } from 'react';
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
    buyerAccountIdFilter,
    handleBuyerFilterChange,
    setPage,
    safePage,
    isLoading,
    isMobile,
    itemsPerPage,
    displayOrders,
    displayRefunds,
    ordersTotalCount,
    ordersTotalPages,
    refundsTotalCount,
    refundsTotalPages,
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
          buyerAccountId={buyerAccountIdFilter}
          onBuyerAccountIdChange={handleBuyerFilterChange}
        />

        {/* Content Views: Skeleton vs Mobile Cards vs Desktop Table wrapped in Activity */}
        {isLoading ? (
          <OrdersSkeleton isMobile={isMobile} />
        ) : (
          <>
            {/* All Orders Activity Tab Panel */}
            <Activity mode={activeMainTab === 'allOrders' ? 'visible' : 'hidden'}>
              {isMobile ? (
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
            </Activity>

            {/* Refunds Activity Tab Panel */}
            <Activity mode={activeMainTab === 'refunds' ? 'visible' : 'hidden'}>
              {isMobile ? (
                <div>
                  {displayRefunds.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                      <EmptyState />
                    </div>
                  ) : (
                    <>
                      {displayRefunds.map((item) => (
                        <MobileOrderCard
                          key={item.id}
                          item={item}
                          type="refunds"
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                      <Pagination
                        currentPage={safePage}
                        totalPages={refundsTotalPages}
                        totalItems={refundsTotalCount}
                        itemsPerPage={itemsPerPage}
                        displayedCount={displayRefunds.length}
                        onPageChange={setPage}
                        isMobile
                      />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <OrdersTable
                    items={displayRefunds}
                    activeMainTab="refunds"
                    onViewDetails={handleViewDetails}
                  />
                  {refundsTotalCount > 0 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={refundsTotalPages}
                      totalItems={refundsTotalCount}
                      itemsPerPage={itemsPerPage}
                      displayedCount={displayRefunds.length}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              )}
            </Activity>
          </>
        )}
      </div>
    </>
  );
}
