import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  useCampaigns,
  useCreateCampaign,
} from '../features/campaigns/hooks/useCampaigns';
import type {
  PushCampaign,
  CreatePushCampaignDto,
} from '../features/campaigns/types';
import { CampaignStatsOverview } from '../features/campaigns/components/CampaignStatsOverview';
import { CampaignsTable } from '../features/campaigns/components/CampaignsTable';
import { MobileCampaignCard } from '../features/campaigns/components/MobileCampaignCard';
import { CreateCampaignModal } from '../features/campaigns/components/CreateCampaignModal';
import { CampaignDetailsModal } from '../features/campaigns/components/CampaignDetailsModal';
import { CampaignEmptyState } from '../features/campaigns/components/CampaignEmptyState';
import { CampaignSkeleton } from '../features/campaigns/components/CampaignSkeleton';

const PAGE_SIZE = 25;

const Campaigns = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<PushCampaign | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Queries & Mutations
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useCampaigns({ pageNum: page, pageSize: PAGE_SIZE });

  const createCampaignMutation = useCreateCampaign();

  const campaigns = useMemo(() => data?.items || [], [data?.items]);
  const pagination = useMemo(
    () =>
      data?.pagination || {
        currentPage: page,
        pageSize: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
      },
    [data?.pagination, page]
  );

  // Client-side search filtering over retrieved items
  const filteredCampaigns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return campaigns;

    return campaigns.filter((c) => {
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchTitleAr = c.titleAr?.toLowerCase().includes(q);
      const matchBody = c.body?.toLowerCase().includes(q);
      const matchBodyAr = c.bodyAr?.toLowerCase().includes(q);
      return matchTitle || matchTitleAr || matchBody || matchBodyAr;
    });
  }, [campaigns, searchQuery]);

  // Handlers
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSubmit = async (dto: CreatePushCampaignDto) => {
    await createCampaignMutation.mutateAsync(dto);
    handleCloseCreateModal();
  };

  const handleViewDetails = (campaign: PushCampaign) => {
    setSelectedCampaign(campaign);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedCampaign(null);
  };

  return (
    <>
      {/* Top Header */}
      <div className="sidebar-page-container-header bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="heading-page-title">
              {t('campaigns.title', 'Push Campaigns')}
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'campaigns.subtitle',
              'Send and track push notifications delivered directly to buyer devices.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={18} />
          <span>{t('campaigns.createBtn', 'New Campaign')}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="sidebar-page-container flex-1 overflow-y-auto pt-0 pb-10">
        {/* KPI Stats Overview */}
        {!isLoading && !isError && campaigns.length > 0 && (
          <CampaignStatsOverview
            campaigns={campaigns}
            totalCampaignsCount={pagination.totalItems}
          />
        )}

        {/* Search & Filter Toolbar */}
        {!isLoading && campaigns.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none rtl:left-auto rtl:right-3">
                <Search size={17} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'campaigns.searchPlaceholder',
                  'Search campaigns by title or content...'
                )}
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-gray-200 hover:border-gray-300 focus:border-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all shadow-2xs rtl:pl-9 rtl:pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3 cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <CampaignSkeleton />}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-red-900 mb-1">
              {t('campaigns.error.title', 'Failed to load campaigns')}
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {(error instanceof Error ? error.message : null) ||
                t(
                  'campaigns.error.description',
                  'An unexpected error occurred while retrieving push campaigns.'
                )}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>{t('common.retry', 'Retry')}</span>
            </button>
          </div>
        )}

        {/* Empty State: No campaigns exist */}
        {!isLoading && !isError && campaigns.length === 0 && (
          <CampaignEmptyState onCreateCampaign={handleOpenCreateModal} />
        )}

        {/* Empty State: Search yielded no matches */}
        {!isLoading &&
          !isError &&
          campaigns.length > 0 &&
          filteredCampaigns.length === 0 && (
            <CampaignEmptyState
              isSearchEmpty
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

        {/* Campaign List: Desktop vs Mobile */}
        {!isLoading && !isError && filteredCampaigns.length > 0 && (
          <>
            {isMobile ? (
              <div className="space-y-3.5">
                {filteredCampaigns.map((campaign) => (
                  <MobileCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <CampaignsTable
                campaigns={filteredCampaigns}
                pagination={pagination}
                onPageChange={(p) => setPage(p)}
                onViewDetails={handleViewDetails}
              />
            )}
          </>
        )}
      </main>

      {/* Modal: Create Campaign */}
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateSubmit}
        isSubmitting={createCampaignMutation.isPending}
      />

      {/* Modal: Campaign Details */}
      <CampaignDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        campaign={selectedCampaign}
      />
    </>
  );
};

export default Campaigns;
