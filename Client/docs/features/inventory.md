# Inventory Management

`inventory.md`

## Features

* [x] Inventory listing & Variant stock tracking
  * Display variant SKU, Product title, thumbnail image, stock level, and last updated date
  * Responsive table interface (`InventoryTable.tsx`) with mobile view support
* [x] Low stock alert badges
  * Highlighting low stock items based on configurable low stock threshold
  * Filtering items by stock status (`inStock`, `lowStock`, `outOfStock`)
* [x] Inline & Batch stock quantity updates
  * Direct inline editing of stock numbers in the table
  * Batch stock update trigger (`bulkUpdateVariantStock`) to save modified quantities in bulk
* [x] Stock search & Filter toolbar
  * Search by SKU or Product name
  * Filter by stock range (`minStock`, `maxStock`) and status
  * Pagination navigation (`InventoryPagination.tsx`)
* [x] Excel stock import & export
  * Export inventory stock sheet to `.xlsx` (`InventoryExportButton.tsx`)
  * Import updated `.xlsx` file to update variant quantities in bulk with summary feedback (updated count & failed rows)

## Status

* Overall: 🟢 Complete
* Implemented:
  * Full inventory page (`Inventory.tsx`) with desktop and mobile layouts
  * Real-time search, filter, and pagination
  * Batch stock editing with save dirty state logic
  * Server endpoint integration for bulk updates and Excel export/import
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/Inventory.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Inventory.tsx): Inventory page entry point
* [`src/features/Inventory/InventoryDesktop.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/InventoryDesktop.tsx): Desktop inventory screen wrapper
* [`src/features/Inventory/InventoryTable.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/InventoryTable.tsx): Table view with inline stock editing
* [`src/features/Inventory/InventoryToolbar.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/InventoryToolbar.tsx): Search, status filter, and bulk save bar
* [`src/features/Inventory/InventoryExportButton.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/InventoryExportButton.tsx): Excel import/export actions button
* [`src/features/Inventory/InventoryPagination.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/InventoryPagination.tsx): Pagination bar component

### API Endpoints

* `POST /vendor/inventory/variants/search`: Query paginated variant inventory with filters
* `POST /vendor/inventory/variants/bulk-stock`: Batch update variant stock quantities
* `GET /vendor/inventory/export`: Export vendor inventory to Excel file
* `POST /vendor/inventory/import`: Import Excel file to update stock levels

### Hooks & Services

* [`src/services/inventory.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/inventory.ts): Inventory service API handlers
* [`src/features/Inventory/hooks/useInventory.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/Inventory/hooks/useInventory.ts): React Query hooks for fetching inventory and executing bulk stock mutations

## Progress

* [x] Paginated variant inventory list
* [x] Search by SKU / Product Name
* [x] Stock status filter (inStock, lowStock, outOfStock)
* [x] Low stock threshold indicator
* [x] Inline stock editing & Batch update
* [x] Excel inventory export & import
