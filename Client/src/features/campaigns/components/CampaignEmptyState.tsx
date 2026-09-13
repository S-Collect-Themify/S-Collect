import { useTranslation } from 'react-i18next';
import { Megaphone, Plus, SearchX } from 'lucide-react';

interface CampaignEmptyStateProps {
  isSearchEmpty?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreateCampaign?: () => void;
}

export const CampaignEmptyState = ({
  isSearchEmpty = false,
  searchQuery = '',
  onClearSearch,
  onCreateCampaign,
}: CampaignEmptyStateProps) => {
  const { t } = useTranslation();

  if (isSearchEmpty) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <SearchX size={24} />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1">
          {t('campaigns.empty.noSearchTitle', 'No campaigns found')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t(
            'campaigns.empty.noSearchDesc',
            'No push campaigns matching "{{query}}". Try checking for typos or searching another term.',
            { query: searchQuery }
          )}
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {t('campaigns.empty.clearSearch', 'Clear Search')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-900 flex items-center justify-center mx-auto mb-4">
        <Megaphone size={28} />
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-1.5">
        {t('campaigns.empty.title', 'No Push Campaigns Yet')}
      </h3>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        {t(
          'campaigns.empty.description',
          'Send real-time push notifications directly to buyer devices to announce sales, new arrivals, or exclusive offers.'
        )}
      </p>
      {onCreateCampaign && (
        <button
          type="button"
          onClick={onCreateCampaign}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white text-xs font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} />
          <span>{t('campaigns.createBtn', 'Send First Campaign')}</span>
        </button>
      )}
    </div>
  );
};
