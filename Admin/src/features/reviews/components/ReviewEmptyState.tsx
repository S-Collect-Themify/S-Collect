import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ReviewEmptyState = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 text-center shadow-xs">
      <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-100/80 flex items-center justify-center mx-auto mb-5 text-gray-400">
        <Search size={24} />
      </div>
      <h3 className="font-semibold text-gray-900 text-xl mb-5">
        {t('reviewsListing.emptyState.title')}
      </h3>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        {t('reviewsListing.emptyState.description')}
      </p>
    </div>
  );
};
