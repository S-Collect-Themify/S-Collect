import { useParams, useSearchParams, Link } from "react-router-dom";
import { ChevronsRight, ChevronLeft, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProductInfo from "../features/AddProducts/productDetails/ProductInfo";
import { useProductDetails } from "../features/products/hooks/useProductDetails";

const ProductDetails = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const productId = paramId || queryId || "";

  const { product, isLoading, isError } = useProductDetails(productId);
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronsRight;

  const productName = product
    ? isAr && product.nameAr
      ? product.nameAr
      : product.name
    : isAr
    ? "تفاصيل المنتج"
    : "Product Details";

  return (
    <>
      {/* Page Header & Breadcrumbs */}
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} className="rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {productName}
            </h1>
            <nav className="mt-1 text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <Link to="/products" className="hover:text-black transition-colors">
                {isAr ? "المنتجات" : "Products"}
              </Link>
              <ChevronIcon size={12} className="text-gray-400" />
              <span className="text-gray-900 font-semibold truncate max-w-[200px]">
                {productName}
              </span>
            </nav>
          </div>
        </div>
      </div>

      <div className="sidebar-page-container space-y-8 pb-12">
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-gray-600" />
            <span className="text-sm font-medium">
              {isAr ? "جاري تحميل تفاصيل المنتج..." : "Loading product details..."}
            </span>
          </div>
        ) : isError || (!product && productId) ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-base font-semibold text-gray-800 mb-1">
              {isAr ? "فشل تحميل تفاصيل المنتج" : "Failed to load product details"}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {isAr ? "يرجى التحقق من الرقم التعريفي للمنتج والمحاولة مرة أخرى." : "Please check the product ID and try again."}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
            >
              {isAr ? "العودة لقائمة المنتجات" : "Back to Products"}
            </Link>
          </div>
        ) : (
          <ProductInfo productDetail={product} />
        )}
      </div>
    </>
  );
};

export default ProductDetails;