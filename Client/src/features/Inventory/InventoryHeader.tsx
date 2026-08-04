import { useTranslation } from 'react-i18next';

export const InventoryHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="sidebar-page-container-header">
      <h5 className="heading-page-title font-bold text-gray-900">
        {t('inventoryPage.title')}
      </h5>
      <p className="text-gray-500 py-2 ">{t('inventoryPage.subtitle')}</p>
    </div>
  );
};

export default InventoryHeader;
