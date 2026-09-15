import { Search, ChevronDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCategoryStore } from '../../../store/categoryStore';
import { useCategoriesData } from '../useCategoriesData';

export const CategoryFilterBar = () => {
  const { t, i18n } = useTranslation();
  const search = useCategoryStore((state) => state.search);
  const departmentFilter = useCategoryStore((state) => state.departmentFilter);
  const setSearch = useCategoryStore((state) => state.setSearch);
  const setDepartmentFilter = useCategoryStore((state) => state.setDepartmentFilter);
  const { categories } = useCategoriesData();
  const departments = categories.filter((c) => c.depth === 0);

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
          className="w-full pl-10 pr-9 rtl:pl-9 rtl:pr-10 py-2.5 rounded-xl border border-gray-200 text-body-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all bg-white"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Clear search"
            className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="relative w-full sm:w-auto shrink-0">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          aria-label={t('categories.filter.allDepartments')}
          className="w-full sm:w-auto appearance-none pl-3 pr-8 rtl:pl-8 rtl:pr-3 py-2.5 p-[2px] rounded-xl border border-gray-200 text-body-sm text-gray-700 focus:outline-none focus:border-gray-900 transition-all bg-white cursor-pointer"
        >
          <option value="all">{t('categories.filter.allDepartments')}</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {i18n.language === 'ar' ? d.nameAr : d.nameEn || d.name}
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
