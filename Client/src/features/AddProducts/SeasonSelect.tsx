import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import type { ProductFormData } from './types';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const SeasonSelect = () => {
  const { t } = useTranslation();
  const { register } = useFormContext<ProductFormData>();
  const { isMobile } = useBreakpoint();

  const inputCls = `w-full rounded-xl border py-2.5 focus:outline-none ${
    isMobile ? 'px-3.5 text-sm border-gray-200 focus:border-gray-900' : 'px-4 border-gray-300 focus:border-gray-950'
  }`;

  const labelCls = isMobile ? 'mb-2 block text-sm font-medium text-gray-700' : 'mb-2 block font-medium';

  return (
    <div>
      <label className={labelCls}>{t('addProduct.season', 'Season')}</label>
      <select className={inputCls} defaultValue="all" {...register('season')}>
        <option value="all">{t('addProduct.seasonAll', 'All Seasons')}</option>
        <option value="summer">{t('addProduct.seasonSummer', 'Summer')}</option>
        <option value="winter">{t('addProduct.seasonWinter', 'Winter')}</option>
      </select>
    </div>
  );
};

export default SeasonSelect;
