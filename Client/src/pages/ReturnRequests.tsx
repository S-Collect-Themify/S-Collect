import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Helmet } from 'react-helmet-async';
import { useReturnRequests } from '../features/Returns/hooks/useReturnRequests';
import { ReturnFilterBar } from '../features/Returns/components/ReturnFilterBar';
import { ReturnRequestsTable } from '../features/Returns/components/ReturnRequestsTable';
import { ReturnRequestsMobileList } from '../features/Returns/components/ReturnRequestsMobileList';
import { ReturnPagination } from '../features/Returns/components/ReturnPagination';

// Re-export StatusBadge to keep imports in ReturnRequestDetailsPage intact
export { StatusBadge } from '../features/Returns/components/StatusBadge';

export default function ReturnRequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    search,
    statusFilter,
    dateFilter,
    activePage,
    currentItems,
    filteredItems,
    totalPages,
    startIndex,
    endIndex,
    pageNumbers,
    handleSearchChange,
    handleStatusFilterChange,
    handleDateFilterChange,
    handlePageChange,
  } = useReturnRequests();

  const handleReview = (id: string) => {
    navigate(`/returns/${encodeURIComponent(id)}`);
  };

  return (
    <>
      {/* Title */}
      <Helmet>
        <title>طلبات الإرجاع – S‑Collect</title>
        <meta
          name="description"
          content="قائمة طلبات الإرجاع للباعة. إدارة ومراجعة الطلبات بسهولة."
        />
      </Helmet>
      <h1 className="sidebar-page-container-header heading-page-title">
        {t('returnsPage.title', { defaultValue: 'Return Requests' })}
      </h1>
      <div className="sidebar-page-container min-h-screen">
        {/* Filter Bar */}
        <ReturnFilterBar
          search={search}
          statusFilter={statusFilter}
          dateFilter={dateFilter}
          onSearchChange={handleSearchChange}
          onStatusFilterChange={handleStatusFilterChange}
          onDateFilterChange={handleDateFilterChange}
        />

        {/* Desktop Table View */}
        <ReturnRequestsTable items={currentItems} onReview={handleReview} />

        {/* Mobile Card List View (Optimized for Mobile) */}
        <ReturnRequestsMobileList
          items={currentItems}
          onReview={handleReview}
        />

        {/* Pagination Footer */}
        <ReturnPagination
          filteredCount={filteredItems.length}
          startIndex={startIndex}
          endIndex={endIndex}
          activePage={activePage}
          totalPages={totalPages}
          pageNumbers={pageNumbers}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
