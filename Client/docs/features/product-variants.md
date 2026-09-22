# Product Variants

`product-variants.md`

## Features

* [x] Auto-generate product variants modal
  * Cartesian product combination generator for options (Colors x Sizes x Custom Attributes)
  * Smart default color palette selector with hex codes (Black, White, Navy, Beige, etc.)
  * Default size list presets (XS to 4XL, One Size)
  * Attribute selection (Color, Size, Custom Vendor Attributes)
  * SKU auto-generation (Random or pattern-based SKU builder)
* [x] Variants table & Inline editing
  * Edit variant SKU, Price, Compare-at Price, and Stock quantity inline
  * Enable / Disable individual variant status (`isActive`)
  * Delete specific variant rows
* [x] Variant pricing & Default pricing policy
  * Base product default pricing cascading to generated variants
  * Independent variant pricing overrides
  * Compare-at price support for individual variants
* [x] Product option binding
  * Create product options (`vendorAttributeId` & `valueIds` mapping)
  * Add option values dynamically
  * Delete options and option values

## Status

* Overall: 🟢 Complete
* Implemented:
  * Cartesian product matrix calculation for automated variant creation
  * `AutoGenerateVariantsModal.tsx` supporting preset colors, sizes, and custom attributes
  * `VariantsTable.tsx` for bulk inline updates of SKU, price, stock, and active status
  * `createProductOption`, `createProductVariant`, `updateProductVariant` API integrations
  * Auto SKU generator utility (`generateRandomSku`)
* Partially implemented:
  * None
* Missing:
  * None
* Known issues:
  * None

## Implementation

### Files & Components

* [`src/features/AddProducts/components/AutoGenerateVariantsModal.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/components/AutoGenerateVariantsModal.tsx): Automated Cartesian product variant generator modal
* [`src/features/AddProducts/components/VariantsTable.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/components/VariantsTable.tsx): Table view for managing and editing generated variant rows
* [`src/features/AddProducts/VariantsPreviewCard.tsx`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/VariantsPreviewCard.tsx): Preview card displaying configured variants summary
* [`src/utils/colorResolver.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/utils/colorResolver.ts): Color string to HEX resolution utility for color attribute previews

### API Endpoints

* `POST /vendor/products/:productId/options`: Create product option linked to attribute
* `POST /vendor/products/:productId/options/:optionId/values`: Add value to option
* `DELETE /vendor/products/:productId/options/:optionId`: Delete product option
* `DELETE /vendor/products/:productId/options/:optionId/values/:valueId`: Delete option value
* `POST /vendor/products/:productId/variants`: Create product variant (SKU, price, stock, optionValueIds)
* `PATCH /vendor/products/:productId/variants/:variantId`: Update product variant (price, stock, compareAtPrice, isActive)

### Hooks & Services

* [`src/services/products.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/services/products.ts): API endpoints for option creation and variant patch/post
* [`src/features/AddProducts/useSaveProduct.ts`](file:///c:/Users/User/Desktop/s-collect/S-Collect/Client/src/features/AddProducts/useSaveProduct.ts): Saves options and variants during product submission workflow

## Progress

* [x] Cartesian product variant matrix auto-generation
* [x] Preset colors & sizes selector
* [x] SKU auto-generation
* [x] Variant price, compare-at price, & stock editing
* [x] Variant active status toggle & deletion
* [x] Backend options and variant sync
