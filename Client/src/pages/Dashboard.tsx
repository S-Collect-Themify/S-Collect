import { useTranslation } from 'react-i18next';
import DashboardGrid from '../features/dashboard/DashboardGrid';
import SalesChart from '../features/dashboard/SalesChart';
import InventoryAlert from '../features/dashboard/InventoryAlert';
import TopSelling from '../features/dashboard/TopSelling';
import RecentOrdersTable from '../features/dashboard/RecentOrdersTable';
import DashboardSkeleton from '../features/dashboard/skeleton/DashboardSkeleton';
import { useProducts } from '../features/AddProducts/useProducts';

const Dashboard = () => {
  const { t } = useTranslation();
  const { isLoading } = useProducts();

  if (isLoading) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="flex flex-col flex-1">
      <div className="sidebar-page-container-header flex items-center justify-between mb-10 bg-gray-50">
        <h1 className="heading-page-title">{t('dashboard')}</h1>
      </div>

      <main className="sidebar-page-container pb-6">
        <DashboardGrid />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch mb-6">
          <div className="col-span-1 lg:col-span-3">
            <SalesChart />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <InventoryAlert />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
          <div className="col-span-1 lg:col-span-2">
            <TopSelling />
          </div>
          <div className="col-span-1 lg:col-span-3">
            <RecentOrdersTable />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
