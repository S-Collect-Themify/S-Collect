# TODO: remove the bulk-stock export/import workaround

Temporary fix for: clicking "Save" on the Inventory page redirected admins to
`/login` without saving. Root cause: no admin-scoped write endpoint exists for
bulk stock updates — only `/vendor/inventory/variants/bulk-stock`, which
rejects admin tokens with 401 and triggers the global logout-on-401
interceptor ([api.ts](../../services/api.ts)).

**Once the backend ships a real `/admin/inventory/variants/bulk-stock` route**
(or fixes the vendor route to accept admin tokens), revert by removing every
piece below — search the codebase for `TEMPORARY WORKAROUND` to find them all.

## 1. [services/inventory.ts](../../services/inventory.ts)
- Delete `bulkUpdateVariantStockViaExportImport` and everything it alone needs:
  `normalizeCell`, `SKU_HEADER_HINTS`, `STOCK_HEADER_HINTS`, `findHeaderColumn`,
  `MinimalExcelCell`, `MinimalExcelRow`, `MinimalExcelWorksheet`, `MinimalExcelJS`.
- In `bulkUpdateVariantStock`, delete the `if (status === 404 || status === 405)`
  branch that calls it.
- `BulkUpdateVariantStockParams.updates[].sku` was added only so the fallback
  above could locate rows by SKU — drop it once the fallback is gone.
- Decide whether `bulkUpdateVariantStock` still needs to return
  `BulkStockUpdateSummary` (partial-failure reporting) once the real endpoint
  is live and always either fully succeeds or throws — if not, simplify back
  to `Promise<void>` and simplify `useInventory.ts`'s `onSuccess` to match.

## 2. [hooks/useInventory.ts](hooks/useInventory.ts)
- `handleStockChange`: drop the `sku` lookup (`rows.find(...).sku`) — only
  needed to feed the fallback above.
- `pendingChanges` ref type and `saveMutation.mutationFn`: drop the `sku`
  field from the change shape.
- `saveMutation.onSuccess`: the `failedSkus` / partial-failure handling only
  matters for the export/import fallback's per-row errors — once the real
  endpoint either fully succeeds or throws, this can go back to
  unconditionally clearing `pendingChanges`/`pendingStock` and always
  toasting success (as it did before this workaround).

## 3. Translations (JSON can't hold a `TODO`/`TEMPORARY` comment directly)
- [locales/en/translation.json](../../locales/en/translation.json):
  `inventoryPage.saveFailedRows`
- [locales/ar/translation.json](../../locales/ar/translation.json):
  `inventoryPage.saveFailedRows`
- Remove both keys **only if** nothing else ends up using them once the
  partial-failure UI above is removed.

## 4. This file
- Delete `BULK_STOCK_WORKAROUND_TODO.md` itself once the above is done.
