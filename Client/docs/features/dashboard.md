# Dashboard & Analytics

`dashboard.md`

## Features

* [x] Executive dashboard grid metrics (`DashboardGrid.tsx`)
  * Total Sales metric card
  * Total Orders metric card
  * New Orders count card
  * Active Products metric card
* [x] Interactive sales performance chart (`SalesChart.tsx`)
  * Interactive SVG / Recharts graph showing sales revenue over time
  * Date range selector (This Week, Last Week, This Month, Custom)
  * Chart view toggle (Revenue vs Orders count)
* [x] Inventory stock alert card (`InventoryAlert.tsx`)
  * Real-time list of low stock and out-of-stock items requiring vendor attention
  * Direct action link to inventory management page
* [x] Top selling products breakdown (`TopSelling.tsx` & `TopSellingCard.tsx`)
  * List of top performing products by sales volume
  * Product thumbnail, name, units sold, and total revenue earned
* [x] Recent incoming orders table (`RecentOrdersTable.tsx`)
  * List of latest incoming sub-orders
  * Direct navigation link to complete sub-order details

## Status

* Overall: 🟢 Complete
* Implemented:
  * Vendor dashboard main screen (`Dashboard.tsx`)
  * Responsive metrics grid connected to `/vendor/sub-orders/stats`
  * Sales performance analytics chart with time period filters
  * Low stock alerts widget connected to inventory API
  * Top selling products widget and recent orders widget
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Dashboard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Dashboard.tsx): Executive dashboard overview page
* [`src/features/dashboard/DashboardGrid.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/DashboardGrid.tsx): Summary metric stats cards (Sales, Orders, New Orders, Products)
* [`src/features/dashboard/SalesChart.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/SalesChart.tsx): Analytics chart component with time filter controls
* [`src/features/dashboard/InventoryAlert.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/InventoryAlert.tsx): Low stock warning panel
* [`src/features/dashboard/TopSelling.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/TopSelling.tsx): Top revenue products list widget
* [`src/features/dashboard/RecentOrdersTable.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/RecentOrdersTable.tsx): Recent sub-orders summary table

### API Endpoints

* `GET /vendor/sub-orders/stats`: Fetch dashboard executive statistics (sales, orders, new orders, product counts)
* `POST /vendor/products/search`: Query top selling and low stock products
* `GET /vendor/sub-orders`: Query recent incoming sub-orders

### Hooks & Services

* [`src/services/orders.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/orders.ts): Vendor order metrics API service (`getVendorOrderStats`)
* [`src/features/dashboard/hooks/useDashboard.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/dashboard/hooks/useDashboard.ts): React Query hooks for fetching dashboard metrics and sales analytics

## Progress

* [x] Executive dashboard stats grid (Total Sales, Total Orders, New Orders, Active Products)
* [x] Sales performance analytics chart with time period filters
* [x] Low stock alert widget
* [x] Top selling products widget
* [x] Recent sub-orders summary table
