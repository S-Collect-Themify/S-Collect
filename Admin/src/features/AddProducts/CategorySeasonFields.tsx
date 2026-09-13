import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { ProductFormData } from './types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { getAdminCategoriesTree } from '../../services/categories';
import { buildCategoryTree, type CategoryTreeNode } from '../categories';

// ─── Department → Category → Sub-Category cascading picker, plus Season ───────
const CategorySeasonFields = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { isMobile } = useBreakpoint();

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['admin-add-product-category-tree'],
    queryFn: async () => buildCategoryTree(await getAdminCategoriesTree()),
    staleTime: 5 * 60 * 1000,
  });

  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const finalCategoryId = watch('categoryId');

  const department = tree.find((d) => d.id === departmentId);
  const categories = useMemo(() => department?.children ?? [], [department]);
  const category = categories.find((c) => c.id === categoryId);
  const subCategories = useMemo(() => category?.children ?? [], [category]);

  const label = (node: CategoryTreeNode) => (isArabic ? node.nameAr || node.name : node.nameEn || node.name);

  const inputCls = (hasError?: unknown) =>
    `w-full rounded-xl border py-2.5 focus:outline-none ${
      isMobile ? 'px-3.5 text-sm' : 'px-4'
    } ${
      hasError
        ? isMobile
          ? 'border-red-400 focus:border-red-400'
          : 'border-red-500 focus:border-red-500'
        : isMobile
          ? 'border-gray-200 focus:border-gray-900'
          : 'border-gray-300 focus:border-gray-950'
    }`;

  const labelCls = isMobile ? 'mb-2 block text-sm font-medium text-gray-700' : 'mb-2 block font-medium';
  const errorCls = isMobile ? 'mt-1 text-xs text-red-500' : 'mt-1 text-sm text-red-500';

  const handleDepartmentChange = (id: string) => {
    setDepartmentId(id);
    setCategoryId('');
    setValue('categoryId', '', { shouldValidate: true });
  };

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    setValue('categoryId', id, { shouldValidate: true });
  };

  const handleSubCategoryChange = (id: string) => {
    setValue('categoryId', id || categoryId, { shouldValidate: true });
  };

  return (
    <>
      {/* Hidden field carrying the actual react-hook-form value/validation */}
      <input type="hidden" {...register('categoryId', { required: t('addProduct.errors.categoryRequired', 'Category is required') })} />

      <div>
        <label className={labelCls}>
          {t('addProduct.department', 'Department')} <span className="text-red-500">*</span>
        </label>
        <select
          className={inputCls()}
          value={departmentId}
          onChange={(e) => handleDepartmentChange(e.target.value)}
        >
          <option value="">
            {isLoading ? t('addProduct.loadingCategories', 'Loading categories...') : t('addProduct.selectDepartment', 'Select a department')}
          </option>
          {tree.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {label(dept)}
            </option>
          ))}
        </select>
      </div>

      {departmentId && (
        <div>
          <label className={labelCls}>
            {t('addProduct.category', 'Category')} <span className="text-red-500">*</span>
          </label>
          <select
            className={inputCls(errors.categoryId?.message)}
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={categories.length === 0}
          >
            <option value="">
              {categories.length === 0
                ? t('addProduct.noCategoriesInDepartment', 'No categories in this department yet')
                : t('addProduct.selectCategory', 'Select a category')}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {label(cat)}
              </option>
            ))}
          </select>
        </div>
      )}

      {categoryId && subCategories.length > 0 && (
        <div>
          <label className={labelCls}>{t('addProduct.subCategory', 'Sub-Category')}</label>
          <select
            className={inputCls()}
            value={finalCategoryId !== categoryId ? finalCategoryId : ''}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
          >
            <option value="">{t('addProduct.selectSubCategoryOptional', 'None (use Category)')}</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {label(sub)}
              </option>
            ))}
          </select>
        </div>
      )}

      {errors.categoryId && <p className={errorCls}>{errors.categoryId.message}</p>}

      <div>
        <label className={labelCls}>{t('addProduct.season', 'Season')}</label>
        <select className={inputCls()} defaultValue="all" {...register('season')}>
          <option value="all">{t('addProduct.seasonAll', 'All Seasons')}</option>
          <option value="summer">{t('addProduct.seasonSummer', 'Summer')}</option>
          <option value="winter">{t('addProduct.seasonWinter', 'Winter')}</option>
        </select>
      </div>
    </>
  );
};

export default CategorySeasonFields;
