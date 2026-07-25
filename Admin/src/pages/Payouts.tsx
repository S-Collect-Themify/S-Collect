import { useTranslation } from 'react-i18next';
import {
  PayoutsHeader,
  PayoutStatCards,
  PayoutsDesktopTable,
  PayoutsMobileList,
  PayoutPagination,
  RegisterPayoutModal,
  ConfirmRegisterPayoutModal,
  usePayouts,
} from '../features/payouts';

export default function Payouts() {
  const { t } = useTranslation();
  const {
    isRtl,
    isLoading,
    stats,
    paginatedItems,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    selectedVendor,
    isModalOpen,
    isConfirmOpen,
    pendingRegistration,
    setCurrentPage,
    setIsModalOpen,
    setIsConfirmOpen,
    handleOpenRegisterModal,
    handleRequestConfirm,
    handleExecuteRegister,
    handleExportExcel,
    handleExportPDF,
  } = usePayouts();

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-50/60 min-h-screen font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Page Header */}
      <PayoutsHeader
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />

      {/* Main Content */}
      <main className="sidebar-page-container py-6 md:py-8 space-y-8">
        {/* Top Summary Stat Cards */}
        <PayoutStatCards stats={stats} isLoading={isLoading} />

        {/* Pending Vendor Payouts Section */}
        <section className="space-y-4">
          <h2 className="text-base md:text-lg font-bold text-gray-900">
            {t('payouts.pendingSectionTitle', 'Pending Vendor Payouts')}
          </h2>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
            {/* Desktop Table View */}
            <PayoutsDesktopTable
              items={paginatedItems}
              onRegisterPayout={handleOpenRegisterModal}
              isLoading={isLoading}
            />

            {/* Mobile Card List View */}
            <PayoutsMobileList
              items={paginatedItems}
              onRegisterPayout={handleOpenRegisterModal}
              isLoading={isLoading}
            />

            {/* Pagination Controls */}
            {!isLoading && totalItems > 0 && (
              <PayoutPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </section>
      </main>

      {/* Register Payout Modal */}
      <RegisterPayoutModal
        isOpen={isModalOpen && !isConfirmOpen}
        item={selectedVendor}
        onClose={() => setIsModalOpen(false)}
        onRequestConfirm={handleRequestConfirm}
      />

      {/* Confirm Payout Registration Modal */}
      <ConfirmRegisterPayoutModal
        isOpen={isConfirmOpen}
        vendorName={selectedVendor?.vendorName}
        amount={pendingRegistration?.amount}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteRegister}
      />
    </div>
  );
}
