import { useTranslation } from 'react-i18next';
import ReceivablesTable from '../features/Receivables/ReceivablesTable';
import ReceivablesGrid from '../features/Receivables/ReceivablesGrid';

const Receivables = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sidebar-page-container-header flex items-center justify-between  bg-gray-50">
        <div>
          <h1 className="heading-page-title">{t('receivables.title')}</h1>
          <p className="text-gray-500 pb-2 ">{t('receivables.description')}</p>
        </div>
      </div>
      <div className="sidebar-page-container space-y-6">
        <ReceivablesGrid />
        <ReceivablesTable />
      </div>
    </>
  );
};

export default Receivables;
