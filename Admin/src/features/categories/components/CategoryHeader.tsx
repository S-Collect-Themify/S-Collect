import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useCategoryStore } from '../../../store/categoryStore';
import { useCategoriesData } from '../useCategoriesData';

export const CategoryHeader = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const openAdd = useCategoryStore((state) => state.openAdd);
  const { categories } = useCategoriesData();

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-bold text-gray-900 heading-page-title">
            {t('categories.title')}
          </h1>
          {categories.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              {categories.length}
            </span>
          )}
        </div>
        {!isMobile && (
          <p className="text-body-sm text-gray-500 mt-1">
            {t('categories.description')}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => openAdd()}
        className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all active:scale-95 cursor-pointer shadow-sm ${
          isMobile
            ? 'h-10 w-10 justify-center bg-gray-950 text-white'
            : 'px-4 py-2.5 bg-gray-950 text-white text-label-md hover:bg-gray-800'
        }`}
      >
        <Plus size={18} />
        {!isMobile && <span>{t('categories.modal.addCategory')}</span>}
      </button>
    </div>
  );
};
