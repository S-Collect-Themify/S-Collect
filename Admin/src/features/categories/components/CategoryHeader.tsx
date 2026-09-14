import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { useCategoryStore } from '../../../store/categoryStore';

export const CategoryHeader = () => {
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();
  const openAdd = useCategoryStore((state) => state.openAdd);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-bold text-gray-900 heading-page-title">
          {t('categories.title')}
        </h1>
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
