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
    setValue,
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
  const resolvedKeyRef = useRef<string | null>(null);

  const watchedDepartmentId = watch('departmentId');
  const watchedCategoryId = watch('categoryId');
  const watchedSubCategoryId = watch('subCategoryId');

  // Preselect Department, Category, and Sub-Category once the tree loads for an existing value (edit mode).
  useEffect(() => {
    if (tree.length === 0) return;

    const targetId = watchedSubCategoryId || watchedCategoryId || watchedDepartmentId;
    if (!targetId) return;

    const currentKey = `${watchedDepartmentId || ''}:${watchedCategoryId || ''}:${watchedSubCategoryId || ''}`;
    if (resolvedKeyRef.current === currentKey) return;

    const ancestry = findCategoryAncestry(tree, targetId);
    if (ancestry) {
      const resolvedDeptId = ancestry.departmentId;
      const resolvedCatId = ancestry.categoryId;
      const resolvedSubCatId = ancestry.subCategoryId;

      setDepartmentId(resolvedDeptId);
      setCategoryId(resolvedCatId);
      setSubCategoryId(resolvedSubCatId);

      const deptNode = tree.find((d) => d.id === resolvedDeptId);
      const catNode = deptNode?.children.find((c) => c.id === resolvedCatId);
      const subCatNode = catNode?.children.find((s) => s.id === resolvedSubCatId);

      if (deptNode) {
        setValue('departmentId', deptNode.id);
        setValue('department', { id: deptNode.id, name: deptNode.name, nameAr: deptNode.nameAr });
      }
      if (catNode) {
        setValue('categoryId', catNode.id);
        setValue('category', { id: catNode.id, name: catNode.name, nameAr: catNode.nameAr });
      }
      if (subCatNode) {
        setValue('subCategoryId', subCatNode.id);
        setValue('subCategory', { id: subCatNode.id, name: subCatNode.name, nameAr: subCatNode.nameAr });
      } else {
        setValue('subCategoryId', undefined);
        setValue('subCategory', undefined);
      }

      const newKey = `${resolvedDeptId}:${resolvedCatId}:${resolvedSubCatId}`;
      resolvedKeyRef.current = newKey;
    } else {
      if (watchedDepartmentId) setDepartmentId(watchedDepartmentId);
      if (watchedCategoryId) setCategoryId(watchedCategoryId);
      if (watchedSubCategoryId) setSubCategoryId(watchedSubCategoryId);
      resolvedKeyRef.current = currentKey;
    }
  }, [tree, watchedDepartmentId, watchedCategoryId, watchedSubCategoryId, setValue]);

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

  const handleDepartmentChange = (val: string) => {
    setDepartmentId(val);
    setCategoryId('');
    setSubCategoryId('');

    const deptNode = tree.find((d) => d.id === val);

    setValue('departmentId', val || undefined, { shouldDirty: true, shouldValidate: true });
    setValue(
      'department',
      deptNode ? { id: deptNode.id, name: deptNode.name, nameAr: deptNode.nameAr } : undefined,
      { shouldDirty: true }
    );

    setValue('categoryId', '', { shouldDirty: true, shouldValidate: true });
    setValue('category', undefined, { shouldDirty: true });

    setValue('subCategoryId', undefined, { shouldDirty: true });
    setValue('subCategory', undefined, { shouldDirty: true });

    resolvedKeyRef.current = `${val}::`;
  };

  const handleCategoryChange = (val: string) => {
    setCategoryId(val);
    setSubCategoryId('');

    const catNode = categories.find((c) => c.id === val);

    setValue('categoryId', val, { shouldDirty: true, shouldValidate: true });
    setValue(
      'category',
      catNode ? { id: catNode.id, name: catNode.name, nameAr: catNode.nameAr } : undefined,
      { shouldDirty: true }
    );

    setValue('subCategoryId', undefined, { shouldDirty: true });
    setValue('subCategory', undefined, { shouldDirty: true });

    resolvedKeyRef.current = `${departmentId}:${val}:`;
  };

  const handleSubCategoryChange = (val: string) => {
    setSubCategoryId(val);

    const subCatNode = subCategories.find((s) => s.id === val);

    if (val && subCatNode) {
      setValue('subCategoryId', val, { shouldDirty: true, shouldValidate: true });
      setValue(
        'subCategory',
        { id: subCatNode.id, name: subCatNode.name, nameAr: subCatNode.nameAr },
        { shouldDirty: true }
      );
    } else {
      setValue('subCategoryId', undefined, { shouldDirty: true });
      setValue('subCategory', undefined, { shouldDirty: true });
    }

    resolvedKeyRef.current = `${departmentId}:${categoryId}:${val || ''}`;
  };

  return (
    <Controller
      name="categoryId"
      control={control}
      rules={{ required: t('addProduct.errors.categoryRequired', 'Category is required') }}
      render={({ field }) => {
        const currentCategoryValue = field.value || categoryId;

        return (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                {t('addProduct.department', 'Department')} <span className="text-red-500">*</span>
              </label>
              <ModernSelect
                value={departmentId}
                onChange={(val) => {
                  field.onChange('');
                  handleDepartmentChange(val);
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
                  value={currentCategoryValue}
                  onChange={(val) => {
                    field.onChange(val);
                    handleCategoryChange(val);
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
                  value={subCategoryId}
                  onChange={handleSubCategoryChange}
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
