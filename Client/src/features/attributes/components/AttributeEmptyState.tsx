import { SlidersHorizontal, Plus, SearchX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AttributeEmptyStateProps {
  isSearchEmpty?: boolean;
  searchQuery?: string;
  onClearSearch?: () => void;
  onCreateAttribute?: () => void;
}

export const AttributeEmptyState = ({
  isSearchEmpty = false,
  searchQuery = '',
  onClearSearch,
  onCreateAttribute,
}: AttributeEmptyStateProps) => {
  const { t } = useTranslation();

  if (isSearchEmpty) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
        <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <SearchX size={26} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {t('attributes.emptySearch.title', 'No matching attributes')}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {t(
            'attributes.emptySearch.description',
            'No attributes found matching "{{query}}". Try searching for another name.',
            { query: searchQuery }
          )}
        </p>
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium text-sm rounded-xl transition-colors cursor-pointer"
          >
            {t('attributes.emptySearch.clear', 'Clear search')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center max-w-lg mx-auto shadow-xs my-8">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
        <SlidersHorizontal size={30} />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {t('attributes.empty.title', 'No attributes yet')}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        {t(
          'attributes.empty.description',
          'Create reusable attributes like Sizes, Colors, or Materials with their values so you can easily assign them when adding products.'
        )}
      </p>
      {onCreateAttribute && (
        <button
          type="button"
          onClick={onCreateAttribute}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <Plus size={18} />
          {t('attributes.empty.action', 'Create First Attribute')}
        </button>
      )}
    </div>
  );
};
