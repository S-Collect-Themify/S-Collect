# Products Management

`products.md`

## Features

* [x] Product creation (Add Product wizard)
  * Basic info (English Name, Arabic Name, Description, Arabic Description)
  * Category / Department / Sub-Category tree selector
  * Season selection (Summer, Winter, All)
  * Base pricing & Compare-at price
  * Initial stock quantity setting
* [x] Product images management
  * Multi-image drag & drop upload
  * Image thumbnail selection (set primary cover image)
  * Image deletion
* [x] Size chart management
  * Size chart image upload
  * Size chart image deletion / replacement
* [x] Product editing
  * Edit basic info, categories, and descriptions
  * Image management during edit
  * Price and stock updates
* [x] Product status control
  * Single product activation / deactivation (publish / unpublish)
  * Bulk status updates (publish / unpublish selected items)
  * Single product deletion
* [x] Product search & Filtering
  * Search by keyword, category, department, sub-category, season, active status, stock status
  * Pagination support
* [x] Bulk Operations
  * Bulk discount application (Percentage or Fixed amount discount with expiration date)
  * Bulk status change
  * Excel Import: Download `.xlsx` template (with local ExcelJS generator fallback & sanitizer)
  * Excel Import: Upload filled Excel sheet to create products in bulk
  * Excel Export: Export current products list as `.xlsx` download
* [x] Product details & Preview
  * Full product details view (`/product-details/:id`)
  * Dynamic desktop and mobile preview cards

## Status

* Overall: 🟢 Complete
* Implemented:
  * Full multi-step Add/Edit product page (`AddProduct.tsx`)
  * Category tree selection using hierarchical modal selector
  * Image and size chart file upload via multipart API endpoints
  * Product activation, deactivation, and single/bulk deletion handlers
  * Excel import template generator, sanitizer, and export file triggers
  * Search, filter, and pagination implementation
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/pages/AddProduct.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/AddProduct.tsx): Add / Edit product wizard page container
* [`src/pages/ProductDetails.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/pages/ProductDetails.tsx): View detailed product view
* [`src/features/AddProducts/BasicInfoFields.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/BasicInfoFields.tsx): English & Arabic title/description inputs
* [`src/features/AddProducts/CategorySelect.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/CategorySelect.tsx): Category tree selection modal & display
* [`src/features/AddProducts/PricingFields.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/PricingFields.tsx): Base price and compare-at price fields
* [`src/features/AddProducts/ProductPreviewCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/ProductPreviewCard.tsx): Live product preview
* [`src/utils/productImportTemplateGenerator.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/utils/productImportTemplateGenerator.ts): Fallback Excel JS template generator
* [`src/utils/productImportSanitizer.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/utils/productImportSanitizer.ts): Excel import sanitizer utility

### API Endpoints

* `GET /vendor/products/:id`: Fetch single product details
* `POST /vendor/products/search`: Search vendor products with filters and pagination
* `POST /vendor/products/full`: Create complete product with multipart media
* `PATCH /vendor/products/:id`: Update product info
* `DELETE /vendor/products/:id`: Delete product
* `POST /vendor/products/:id/activate`: Activate/publish product
* `POST /vendor/products/:id/deactivate`: Deactivate/unpublish product
* `POST /vendor/products/:id/images`: Upload product image
* `DELETE /vendor/products/:id/images/:imageId`: Delete product image
* `PATCH /vendor/products/:id/images/:imageId/thumbnail`: Set primary thumbnail image
* `POST /vendor/products/:id/size-chart-images`: Upload size chart image
* `DELETE /vendor/products/:id/size-chart-images/:imageId`: Delete size chart image
* `POST /vendor/products/bulk-status`: Bulk publish/unpublish products
* `POST /vendor/products/bulk-discount`: Apply bulk discount to selected products
* `GET /vendor/products/import/template`: Download import Excel template
* `POST /vendor/products/import`: Upload Excel sheet to import products
* `GET /vendor/products/export`: Export products to Excel sheet

### Hooks & Services

* [`src/services/products.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/products.ts): Comprehensive product API services
* [`src/features/AddProducts/useAddProductPage.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/useAddProductPage.ts): Page state and form handling hook
* [`src/features/AddProducts/useCreateProduct.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/useCreateProduct.ts): Product creation mutation hook
* [`src/features/AddProducts/useUpdateProduct.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/useUpdateProduct.ts): Product update mutation hook

## Progress

* [x] Product creation form wizard
* [x] Category & department tree picker
* [x] Image upload, deletion, & thumbnail selection
* [x] Size chart image management
* [x] Product editing & status toggling (Activate / Deactivate)
* [x] Single and bulk product deletion
* [x] Product search & pagination
* [x] Bulk status updates & Bulk discount application
* [x] Excel product import & export
