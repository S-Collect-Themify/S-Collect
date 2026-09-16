import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext, Controller } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import type { ProductFormData } from './types';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ModernSelect } from '../../components/ui/ModernSelect';
import { getCategoriesTree } from '../../services/products';
import { buildCategoryTree, findCategoryAncestry, type CategoryTreeNode } from '../../utils/categoryTree';

const CategorySelect = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormData>();
  const { isMobile } = useBreakpoint();

  const { data: tree = [], isLoading } = useQuery({
    queryKey: ['category-tree'],
    queryFn: async () => buildCategoryTree(await getCategoriesTree()),
    staleTime: 5 * 60 * 1000,
  });

  const [departmentId, setDepartmentId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const resolvedForValue = useRef<string | null>(null);
  const currentValue = watch('categoryId');

  // Preselect Department/Category/SubCategory once the tree loads for an existing value (edit mode).
  useEffect(() => {
    if (!currentValue || tree.length === 0 || resolvedForValue.current === currentValue) return;
    resolvedForValue.current = currentValue;
    const ancestry = findCategoryAncestry(tree, currentValue);
    if (ancestry) {
      setDepartmentId(ancestry.departmentId);
      setCategoryId(ancestry.categoryId);
      setSubCategoryId(ancestry.subCategoryId);
    }
  }, [tree, currentValue]);

  const labelCls = isMobile ? 'mb-2 block text-sm font-medium text-gray-700' : 'mb-2 block font-medium';
  const errorCls = isMobile ? 'mt-1 text-xs text-red-500' : 'mt-1 text-sm text-red-500';

  const label = (node: CategoryTreeNode) => (isArabic ? node.nameAr || node.name : node.name);

  const departmentOptions = tree.map((d) => ({ label: label(d), value: d.id }));
  const department = tree.find((d) => d.id === departmentId);
  const categories = useMemo(() => department?.children ?? [], [department]);
  const categoryOptions = categories.map((c) => ({ label: label(c), value: c.id }));
  const category = categories.find((c) => c.id === categoryId);
  const subCategories = useMemo(() => category?.children ?? [], [category]);
  const subCategoryOptions = subCategories.map((s) => ({ label: label(s), value: s.id }));

  return (
    <Controller
      name="categoryId"
      control={control}
      rules={{ required: t('addProduct.errors.categoryRequired', 'Category is required') }}
      render={({ field }) => {
        const finalId = field.value || '';
        const subCategoryValue = subCategories.some((s) => s.id === finalId)
          ? finalId
          : subCategoryId;

        return (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('addProduct.department', 'Department')} <span className="text-red-500">*</span>
              </label>
              <ModernSelect
                value={departmentId}
                onChange={(val) => {
                  setDepartmentId(val);
                  setCategoryId('');
                  setSubCategoryId('');
                  field.onChange(val);
                }}
                options={departmentOptions}
                placeholder={isLoading ? t('addProduct.loadingCategories', 'Loading categories...') : t('addProduct.selectDepartment', 'Select a department')}
                size={isMobile ? 'sm' : 'md'}
                isSearchable
                maxHeight={260}
              />
            </div>

            {departmentId && (
              <div>
                <label className={labelCls}>
                  {t('addProduct.category', 'Category')} <span className="text-red-500">*</span>
                </label>
                <ModernSelect
                  value={categoryId}
                  onChange={(val) => {
                    setCategoryId(val);
                    setSubCategoryId('');
                    field.onChange(val || departmentId);
                  }}
                  options={categoryOptions}
                  placeholder={
                    categories.length === 0
                      ? t('addProduct.noCategoriesInDepartment', 'No categories in this department yet')
                      : t('addProduct.selectCategory', 'Select a category')
                  }
                  size={isMobile ? 'sm' : 'md'}
                  isSearchable
                  maxHeight={260}
                  className={errors.categoryId ? (isMobile ? '!border-red-400 focus:!border-red-400' : '!border-red-500 focus:!border-red-500') : ''}
                />
              </div>
            )}

            {categoryId && subCategories.length > 0 && (
              <div>
                <label className={labelCls}>{t('addProduct.subCategory', 'Sub-Category')}</label>
                <ModernSelect
                  value={subCategoryValue}
                  onChange={(val) => {
                    setSubCategoryId(val);
                    field.onChange(val || categoryId || departmentId);
                  }}
                  options={subCategoryOptions}
                  placeholder={t('addProduct.selectSubCategoryOptional', 'None (use Category)')}
                  size={isMobile ? 'sm' : 'md'}
                  isSearchable
                  maxHeight={260}
                />
              </div>
            )}

            {errors.categoryId && <p className={errorCls}>{errors.categoryId.message}</p>}
          </div>
        );
      }}
    />
  );
};

export default CategorySelect;
