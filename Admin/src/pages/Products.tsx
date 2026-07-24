import { useMemo } from 'react';
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
  ProductPagination,
  type ProductItem,
} from '../features/products';

const Products = () => {
  const { isMobile } = useBreakpoint();

  // ── Query & Mutation Hook ──
  const { statusMutation } = useProductsData();

  // ── Store State ──
  const products = useProductStore((s) => s.products);
  const search = useProductStore((s) => s.search);
  const vendorFilter = useProductStore((s) => s.vendorFilter);
  const categoryFilter = useProductStore((s) => s.categoryFilter);
  const statusFilter = useProductStore((s) => s.statusFilter);
  const currentPage = useProductStore((s) => s.currentPage);
  const modal = useProductStore((s) => s.modal);

  // ── Store Actions ──
  const setCurrentPage = useProductStore((s) => s.setCurrentPage);
  const openDisableModal = useProductStore((s) => s.openDisableModal);
  const closeDisableModal = useProductStore((s) => s.closeDisableModal);

  // ── Extract Unique Filter Options ──
  const availableVendors = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.vendor))).filter(Boolean);
    return list.sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return list.sort();
  }, [products]);

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
        if (!matchName && !matchNameAr && !matchVendor && !matchCategory) {
          return false;
        }
      }

      // Vendor Filter
      if (vendorFilter !== 'all' && item.vendor !== vendorFilter) {
        return false;
      }

      // Category Filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
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
        {isMobile ? (
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
      </div>
    </>
  );
};

export default Products;
