import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pagination } from '../features/Orders/components/Pagination';
import {
  CommissionRatesHeader,
  PlatformDefaultCommissionCard,
  VendorCommissionTable,
  VendorCommissionMobileList,
  CategoryCommissionTable,
  CategoryCommissionMobileList,
  EditCommissionModal,
  ConfirmRateChangeModal,
  useCommissionRates,
} from '../features/commissionRates';

export default function CommissionRates() {
  const { t } = useTranslation();
  const {
    isRtl,
    isLoading,
    platformCommission,
    vendorCommissions,
    categoryCommissions,
    editTarget,
    isModalOpen,
    isConfirmOpen,
    setIsModalOpen,
    setIsConfirmOpen,
    handleOpenEditPlatform,
    handleOpenEditVendor,
    handleOpenEditCategory,
    handleRequestConfirm,
    handleConfirmRateChange,
    handleResetVendorCommission,
    handleResetCategoryCommission,
    handleExportExcel,
    handleExportPDF,
  } = useCommissionRates();

  const ITEMS_PER_PAGE = 20;

  // Pagination states
  const [vendorPage, setVendorPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  // Paginated items
  const paginatedVendors = vendorCommissions.slice(
    (vendorPage - 1) * ITEMS_PER_PAGE,
    vendorPage * ITEMS_PER_PAGE
  );

  const paginatedCategories = categoryCommissions.slice(
    (categoryPage - 1) * ITEMS_PER_PAGE,
    categoryPage * ITEMS_PER_PAGE
  );

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50/60 min-h-screen font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Standard Header */}
      <CommissionRatesHeader
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content */}
      <main className="sidebar-page-container py-6 md:py-8 space-y-8">
        {/* Top Platform Default Commission Banner */}
        <PlatformDefaultCommissionCard
          platformData={platformCommission}
          onEdit={handleOpenEditPlatform}
          isLoading={isLoading}
        />

        {/* Vendor Commission Rates Section */}
        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            {t('commissionRates.vendorSectionTitle', 'Vendor Commission Rates')}
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <VendorCommissionTable
              items={paginatedVendors}
              platformRate={platformCommission.rate}
              onEdit={handleOpenEditVendor}
              onReset={handleResetVendorCommission}
              isLoading={isLoading}
            />
            <VendorCommissionMobileList
              items={paginatedVendors}
              platformRate={platformCommission.rate}
              onEdit={handleOpenEditVendor}
              onReset={handleResetVendorCommission}
              isLoading={isLoading}
            />

            {/* Vendor Table Pagination */}
            <Pagination
              currentPage={vendorPage}
              totalPages={Math.ceil(vendorCommissions.length / ITEMS_PER_PAGE)}
              totalItems={vendorCommissions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setVendorPage}
              displayedCount={paginatedVendors.length}
            />
          </div>
        </section>

        {/* Category Commission Rates Section */}
        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            {t('commissionRates.categorySectionTitle', 'Category Commission Rates')}
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            <CategoryCommissionTable
              items={paginatedCategories}
              platformRate={platformCommission.rate}
              onEdit={handleOpenEditCategory}
              onReset={handleResetCategoryCommission}
              isLoading={isLoading}
            />
            <CategoryCommissionMobileList
              items={paginatedCategories}
              platformRate={platformCommission.rate}
              onEdit={handleOpenEditCategory}
              onReset={handleResetCategoryCommission}
              isLoading={isLoading}
            />

            {/* Category Table Pagination */}
            <Pagination
              currentPage={categoryPage}
              totalPages={Math.ceil(categoryCommissions.length / ITEMS_PER_PAGE)}
              totalItems={categoryCommissions.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCategoryPage}
              displayedCount={paginatedCategories.length}
            />
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      <EditCommissionModal
        isOpen={isModalOpen && !isConfirmOpen}
        target={editTarget}
        onClose={() => setIsModalOpen(false)}
        onRequestConfirm={handleRequestConfirm}
        onReset={(id, type) => {
          if (type === 'vendor') {
            const vendorItem = vendorCommissions.find((v) => v.id === id);
            if (vendorItem) handleResetVendorCommission(vendorItem);
          } else {
            const categoryItem = categoryCommissions.find((c) => c.id === id);
            if (categoryItem) handleResetCategoryCommission(categoryItem);
          }
        }}
      />

      {/* Confirm Rate Change Modal */}
      <ConfirmRateChangeModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmRateChange}
      />
    </div>
  );
}


