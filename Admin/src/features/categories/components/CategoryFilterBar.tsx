import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../../../store/categoryStore';
import { useCategoriesData } from '../useCategoriesData';

export const CategoryFilterBar = () => {
  const { t, i18n } = useTranslation();
  const search = useCategoryStore((state) => state.search);
  const categoryFilter = useCategoryStore((state) => state.categoryFilter);
  const setSearch = useCategoryStore((state) => state.setSearch);
  const setCategoryFilter = useCategoryStore((state) => state.setCategoryFilter);
  const { categories } = useCategoriesData();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
      <div className="relative flex-1 w-full sm:max-w-sm">
        <Search
          size={15}
          className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={t('categories.filter.search')}
          placeholder={t('categories.filter.search')}
          className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 p-[2px] rounded-xl border border-gray-200 text-body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-white"
        />
      </div>

      <div className="relative w-full sm:w-auto shrink-0">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          aria-label={t('categories.filter.all')}
          className="w-full sm:w-auto appearance-none pl-3 pr-8 rtl:pl-8 rtl:pr-3 py-2.5 p-[2px] rounded-xl border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer"
        >
          <option value="all">{t('categories.filter.all')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {i18n.language === 'ar' ? c.nameAr : c.nameEn || c.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
      </div>
    </div>
  );
};
