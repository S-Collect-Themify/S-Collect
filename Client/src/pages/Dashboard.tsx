import { useTranslation } from 'react-i18next';
import { AlertCircle, RefreshCw } from 'lucide-react';
import DashboardGrid from '../features/dashboard/DashboardGrid';
import SalesChart from '../features/dashboard/SalesChart';
import InventoryAlert from '../features/dashboard/InventoryAlert';
import TopSelling from '../features/dashboard/TopSelling';
import RecentOrdersTable from '../features/dashboard/RecentOrdersTable';
import DashboardSkeleton from '../features/dashboard/skeleton/DashboardSkeleton';
import { useProducts } from '../features/AddProducts/useProducts';

const Dashboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useProducts();

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-4 text-red-500 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          {error.message ||
            'An unexpected error occurred while fetching dashboard data.'}
        </p>
        {refetch && (
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (isLoading || !data) {
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
