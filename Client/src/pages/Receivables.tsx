import { useTranslation } from 'react-i18next';
import ReceivablesTable from '../features/Receivables/ReceivablesTable';
import ReceivablesGrid from '../features/Receivables/ReceivablesGrid';

const Receivables = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="sidebar-page-container flex items-center justify-between md:mb-10 mb-5 bg-gray-50">
        <div>
          <h1 className="heading-page-title py-2">{t('receivables.title')}</h1>
          <p className="text-gray-500 pb-2 ">{t('receivables.description')}</p>
        </div>
      </div>
      <div className="sidebar-page-container">
        <ReceivablesGrid />
        <div className="rounded-2xl border border-gray-100 lg:bg-white  lg:p-6">
          <ReceivablesTable />
        </div>
      </div>
    </>
  );
};

export default Receivables;
