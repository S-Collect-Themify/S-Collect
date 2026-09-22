# Product Catalog Management

`management.md`

## Features

* [x] Product catalog management table (`ManagementTable.tsx` & `MobileManagementTable.tsx`)
  * Displays product name, category, price, stock, active status, and action controls
  * Search product catalog by name
  * Filter by category, department, sub-category, season, active status, stock status
  * Sorting and pagination
* [x] Bulk operations toolbar
  * Row selection checkboxes (`selectedRows` in Zustand store)
  * Bulk status update modal / trigger (Publish / Unpublish selected products)
  * Bulk discount modal (`BulkDiscountModal.tsx`) applying percentage or fixed discounts with end date
* [x] Product import & export triggers
  * Import products modal (`ImportProductsModal.tsx`) supporting template download and `.xlsx` upload
  * Export product catalog button triggering browser download of `.xlsx` sheet

## Status

* Overall: 🟢 Complete
* Implemented:
  * Catalog management screen (`Mangement.tsx`) supporting desktop and mobile responsiveness
  * Selection state management via Zustand (`managementStore.ts`)
  * Bulk status change & Bulk discount application mutations
  * Integration with Excel import/export endpoints
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * File name typo in codebase (`src/pages/Mangement.tsx` instead of `Management.tsx`), handled via import routes

## Implementation

### Files & Components

* [`src/pages/Mangement.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/Mangement.tsx): Product catalog management page
* [`src/features/mangement/ManagementTable.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/mangement/ManagementTable.tsx): Catalog data grid with inline filters and checkboxes
* [`src/features/mangement/components/BulkDiscountModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/mangement/components/BulkDiscountModal.tsx): Modal for applying bulk discounts
* [`src/features/mangement/components/ImportProductsModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/mangement/components/ImportProductsModal.tsx): Modal for importing products from Excel
* [`src/features/mangement/managementStore.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/mangement/managementStore.ts): Selection & modal state store

### API Endpoints

* `POST /vendor/products/search`: Query vendor catalog
* `POST /vendor/products/bulk-status`: Bulk publish/unpublish selected products
* `POST /vendor/products/bulk-discount`: Bulk apply discount
* `GET /vendor/products/import/template`: Download import template
* `POST /vendor/products/import`: Import products sheet
* `GET /vendor/products/export`: Export product catalog

### Hooks & Services

* [`src/services/products.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/products.ts): Product API services
* [`src/features/mangement/useManagementHooks.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/mangement/useManagementHooks.ts): Custom hooks for table pagination, selection, bulk status, bulk discount, and export

## Progress

* [x] Product catalog table view & mobile cards
* [x] Catalog search, filter, & sort
* [x] Row selection checkboxes & state management
* [x] Bulk status update (Publish / Unpublish)
* [x] Bulk discount application modal
* [x] Excel product catalog import & export
