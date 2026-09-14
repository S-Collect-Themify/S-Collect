import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useVendors } from '../features/vendors/hooks/useVendors';
import VendorReportVendorDropdown from '../features/vendorReports/components/VendorReportVendorDropdown';
import {
  usePushCampaigns,
  useCreatePushCampaign,
  NotificationTable,
  NotificationMobileList,
  SendCampaignModal,
} from '../features/notifications';
import { Pagination } from '../features/Orders/components/Pagination';

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const [page, setPage] = useState(1);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Fetch vendors for filter (API caps pageSize at 100)
  const { data: vendorsData, isLoading: isVendorsLoading } = useVendors({ pageSize: 100 });

  const vendorsList = useMemo(() => {
    if (Array.isArray(vendorsData?.items)) return vendorsData.items;
    if (Array.isArray(vendorsData)) return vendorsData;
    return [];
  }, [vendorsData]);

  // Fetch push campaigns GET /api/v1/admin/push-campaigns
  const { data: responseData, isLoading } = usePushCampaigns({
    pageNum: page,
    pageSize: PAGE_SIZE,
    vendorId: selectedVendorId || undefined,
  });

  const createMutation = useCreatePushCampaign();

  const campaigns = responseData?.items || [];
  const pagination = responseData?.pagination || {
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalItems: campaigns.length,
    totalPages: 1,
  };

  const handleSendCampaign = (data: {
    title: string;
    titleAr: string;
    body: string;
    bodyAr: string;
    imageUrl?: string;
  }) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsSendModalOpen(false);
      },
    });
  };

  return (
    <>
      {/* Header Container */}
      <div className="sidebar-page-container-header bg-white border-b border-gray-200/80 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-bold text-gray-900 heading-page-title">
                {t('notificationsPage.title', 'Push Notifications')}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {t('notificationsPage.subtitle', 'Broadcast push notifications and review past push campaigns')}
              </p>
            </div>
          </div>

          {/* Top Right Action Button */}
          <button
            type="button"
            onClick={() => setIsSendModalOpen(true)}
            className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 text-white text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Send size={16} />
            <span>{t('notificationsPage.sendButton', 'Send Notification')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto py-4 sm:py-6 sidebar-page-container space-y-4 sm:space-y-6">
        {/* Vendor Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-gray-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
              {t('notificationsPage.vendorFilterLabel', 'Filter by Vendor')}:
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <VendorReportVendorDropdown
                vendors={vendorsList}
                selectedVendorId={selectedVendorId}
                onSelectVendor={(id) => {
                  setSelectedVendorId(id);
                  setPage(1);
                }}
                isLoading={isVendorsLoading}
              />

              {selectedVendorId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVendorId('');
                    setPage(1);
                  }}
                  className="px-3 py-2 sm:py-1.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-600 transition-colors cursor-pointer shrink-0"
                >
                  {t('common.clearFilter', 'Clear Filter')}
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium self-end sm:self-auto pt-1 sm:pt-0">
            {t('notificationsPage.totalCampaigns', 'Total Campaigns')}:{' '}
            <span className="font-bold text-gray-800">{pagination.totalItems}</span>
          </div>
        </div>

        {/* Content Table / Mobile List */}
        {isMobile ? (
          <div>
            <NotificationMobileList campaigns={campaigns} isLoading={isLoading} />
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setPage}
              isMobile
              displayedCount={campaigns.length}
            />
          </div>
        ) : (
          <div>
            <NotificationTable campaigns={campaigns} isLoading={isLoading} />
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setPage}
              displayedCount={campaigns.length}
            />
          </div>
        )}
      </div>

      {/* Send Push Notification Modal */}
      <SendCampaignModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSend={handleSendCampaign}
        isSending={createMutation.isPending}
      />
    </>
  );
}
