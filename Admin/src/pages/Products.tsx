import { useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../hooks/useBreakpoint';
import {
  ITEMS_PER_PAGE,
  useProductStore,
  useProductsData,
  ProductHeader,
  ProductFilterBar,
  ProductTable,
  ProductMobileList,
  ProductDisableModal,
  BulkDiscountModal,
  ProductPagination,
  ProductSkeleton,
  type ProductItem,
} from '../features/products';

const Products = () => {
  const { isMobile } = useBreakpoint();
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  // ── Query & Mutation Hook ──
  const { productsQuery, statusMutation, bulkDiscountMutation } = useProductsData();

  // ── Store State ──
  const products = useProductStore((s) => s.products);
  const search = useProductStore((s) => s.search);
  const vendorFilter = useProductStore((s) => s.vendorFilter);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  const statusFilter = useProductStore((s) => s.statusFilter);
  const currentPage = useProductStore((s) => s.currentPage);
  const modal = useProductStore((s) => s.modal);
  const selectedProductIds = useProductStore((s) => s.selectedProductIds);
  const isBulkDiscountModalOpen = useProductStore((s) => s.isBulkDiscountModalOpen);

  // ── Store Actions ──
  const setVendorFilter = useProductStore((s) => s.setVendorFilter);
  const setCurrentPage = useProductStore((s) => s.setCurrentPage);
  const openDisableModal = useProductStore((s) => s.openDisableModal);
  const closeDisableModal = useProductStore((s) => s.closeDisableModal);
  const closeBulkDiscountModal = useProductStore((s) => s.closeBulkDiscountModal);

  // ── Reset Page on Mount ──
  useEffect(() => {
    setCurrentPage(1);
  }, [setCurrentPage]);

  // ── URL Vendor Filter Auto-selection ──
  useEffect(() => {
    const urlVendorName = searchParams.get('vendorName') || searchParams.get('vendor');
    const urlVendorId = searchParams.get('vendorId');

    if (urlVendorName) {
      setVendorFilter(urlVendorName);
    } else if (urlVendorId) {
      const matched = products.find(
        (p) => String(p.vendorId).toLowerCase() === String(urlVendorId).toLowerCase()
      );
      if (matched) {
        setVendorFilter(matched.vendor);
      } else {
        setVendorFilter(urlVendorId);
      }
    }
  }, [searchParams, products, setVendorFilter]);

  // ── Extract Unique Filter Options ──
  const availableVendors = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.vendor))).filter(Boolean);
    return list.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    products.forEach((p) => {
      if (p.category) {
        const label = isAr && p.categoryAr ? p.categoryAr : p.category;
        if (!map.has(p.category)) {
          map.set(p.category, { key: p.category, label });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [products, isAr]);

  // ── Filtering Logic ──
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Search Filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNameAr = item.nameAr ? item.nameAr.toLowerCase().includes(q) : false;
        const matchVendor = item.vendor.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        const matchCategoryAr = item.categoryAr ? item.categoryAr.toLowerCase().includes(q) : false;
        if (!matchName && !matchNameAr && !matchVendor && !matchCategory && !matchCategoryAr) {
          return false;
        }
      }

      // Vendor Filter
      if (vendorFilter !== 'all') {
        const filterLower = vendorFilter.toLowerCase();
        const matchVendorName = item.vendor.toLowerCase() === filterLower;
        const matchVendorId = item.vendorId && String(item.vendorId).toLowerCase() === filterLower;
        if (!matchVendorName && !matchVendorId) {
          return false;
        }
      }

      // Category Filter
      if (categoryFilter !== 'all') {
        const filterLower = categoryFilter.toLowerCase();
        const matchCat = item.category.toLowerCase() === filterLower;
        const matchCatAr = item.categoryAr ? item.categoryAr.toLowerCase() === filterLower : false;
        if (!matchCat && !matchCatAr) {
          return false;
        }
      }

      // Status Filter
      if (statusFilter === 'active' && !item.isActive) {
        return false;
      }
      if (statusFilter === 'disabled' && item.isActive) {
        return false;
      }

      return true;
    });
  }, [products, search, vendorFilter, categoryFilter, statusFilter]);

  // ── Pagination Calculation ──
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // ── Handle Toggle Switch Click ──
  const handleToggleStatus = (product: ProductItem) => {
    if (product.isActive) {
      // If product is currently active, prompt confirmation modal to disable
      openDisableModal(product);
    } else {
      // If product is currently disabled, directly enable
      statusMutation.mutate({ id: product.id, isActive: true });
    }
  };

  // ── Confirm Disabling Product ──
  const handleConfirmDisable = () => {
    if (modal.product) {
      statusMutation.mutate({ id: modal.product.id, isActive: false });
    }
  };

  return (
    <>
      {/* Header Banner */}
      <div className="sidebar-page-container-header">
        <ProductHeader />
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 sidebar-page-container transition-all">
        {/* Search & Filter Controls */}
        <ProductFilterBar
          availableVendors={availableVendors}
          availableCategories={availableCategories}
        />

        {/* Product List Content */}
        {productsQuery.isLoading ? (
          <ProductSkeleton isMobile={isMobile} />
        ) : isMobile ? (
          <div className="space-y-3">
            <ProductMobileList
              products={paginatedProducts}
              onToggleStatus={handleToggleStatus}
            />

            {filteredProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-3">
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ProductTable
              products={paginatedProducts}
              onToggleStatus={handleToggleStatus}
            />

            {filteredProducts.length > 0 && (
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}

        {/* Disable Confirmation Modal */}
        <ProductDisableModal
          isOpen={modal.open}
          product={modal.product}
          onClose={closeDisableModal}
          onConfirm={handleConfirmDisable}
        />

        {/* Bulk Discount Modal */}
        <BulkDiscountModal
          isOpen={isBulkDiscountModalOpen}
          selectedCount={selectedProductIds.length}
          onClose={closeBulkDiscountModal}
          isPending={bulkDiscountMutation.isPending}
          onSubmit={(data) => {
            bulkDiscountMutation.mutate({
              productIds: selectedProductIds,
              ...data,
            });
          }}
        />
      </div>
    </>
  );
};

export default Products;
