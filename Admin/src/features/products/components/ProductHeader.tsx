import { useTranslation } from 'react-i18next';

export const ProductHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between py-2">
      <h1 className="text-2xl font-semibold text-gray-900">
        {t('productsListing.title')}
      </h1>
    </div>
  );
};
