import { useTranslation } from 'react-i18next';
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
    handleExportExcel,
    handleExportPDF,
  } = useCommissionRates();

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
              items={vendorCommissions}
              onEdit={handleOpenEditVendor}
              isLoading={isLoading}
            />
            <VendorCommissionMobileList
              items={vendorCommissions}
              onEdit={handleOpenEditVendor}
              isLoading={isLoading}
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
              items={categoryCommissions}
              onEdit={handleOpenEditCategory}
              isLoading={isLoading}
            />
            <CategoryCommissionMobileList
              items={categoryCommissions}
              onEdit={handleOpenEditCategory}
              isLoading={isLoading}
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
