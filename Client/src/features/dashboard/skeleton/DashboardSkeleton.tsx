import DashboardGridSkeleton from './DashboardGridSkeleton';
import SalesChartSkeleton from './SalesChartSkeleton';
import InventoryAlertSkeleton from './InventoryAlertSkeleton';
import TopSellingSkeleton from './TopSellingSkeleton';
import RecentOrdersTableSkeleton from './RecentOrdersTableSkeleton';

const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <div className="sidebar-page-container flex items-center justify-between md:mb-10 mb-5 bg-gray-50">
        <div className="h-8 w-40 bg-gray-200 rounded py-5 animate-pulse" />
      </div>

      <main className="sidebar-page-container pb-6">
        <DashboardGridSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch md:mb-6 mb-3">
          <div className="col-span-1 lg:col-span-3">
            <SalesChartSkeleton />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <InventoryAlertSkeleton />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
          <div className="col-span-1 lg:col-span-2">
            <TopSellingSkeleton />
          </div>
          <div className="col-span-1 lg:col-span-3">
            <RecentOrdersTableSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardSkeleton;
