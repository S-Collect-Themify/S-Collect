import { useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ChevronsRight, ChevronLeft, Loader2, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import ProductInfo from "../features/AddProducts/productDetails/ProductInfo";
import ProductRating, {
  type RatingCount,
} from "../features/AddProducts/productDetails/ProductRating";
import ReviewsList, {
  type Review,
  type ReviewFilter,
} from "../features/AddProducts/productDetails/ReviewsList";
import DeleteReviewModal from "../features/AddProducts/productDetails/DeleteReviewModal";

import { useProductDetails } from "../features/products/hooks/useProductDetails";
import {
  useProductsData,
  useProductStore,
  ProductDisableModal,
} from "../features/products";
import { type SingleAdminProductDetail } from "../services/products";
import {
  getProductRatingSummary,
  getProductReviews,
  deleteReviewApi,
} from "../services/reviews";

const ProductDetails = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get("id");
  const productId = paramId || queryId || "";

  const { product, isLoading, isError } = useProductDetails(productId);
  const { statusMutation } = useProductsData();
  const modal = useProductStore((s) => s.modal);
  const openDisableModal = useProductStore((s) => s.openDisableModal);
  const closeDisableModal = useProductStore((s) => s.closeDisableModal);

  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const ChevronIcon = isAr ? ChevronLeft : ChevronsRight;

  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("all");
  const [page, setPage] = useState(1);

  const { data: summaryData } = useQuery({
    queryKey: ["product-rating-summary", productId],
    queryFn: () => getProductRatingSummary(productId),
    enabled: Boolean(productId),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => getProductReviews({ productId }),
    enabled: Boolean(productId),
  });

  const [reviewToDeleteId, setReviewToDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReviewApi(reviewId),
    onSuccess: () => {
      toast.success(isAr ? "تم حذف التقييم بنجاح" : "Review deleted successfully");
      setReviewToDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product-rating-summary", productId] });
    },
    onError: () => {
      toast.error(isAr ? "فشل حذف التقييم" : "Failed to delete review");
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    setReviewToDeleteId(reviewId);
  };

  const rawReviewsList = useMemo(() => {
    if (!reviewsData) return [];
    if (Array.isArray(reviewsData)) return reviewsData;
    if (Array.isArray(reviewsData.items)) return reviewsData.items;
    if (Array.isArray(reviewsData.reviews)) return reviewsData.reviews;
    if (Array.isArray(reviewsData.data)) return reviewsData.data;
    if (reviewsData.data && Array.isArray(reviewsData.data.items))
      return reviewsData.data.items;
    return [];
  }, [reviewsData]);

  const mappedReviews: Review[] = useMemo(() => {
    return rawReviewsList.map((rev: any) => {
      const buyerObj = rev?.buyer || rev?.user || rev?.customer;
      const fName = buyerObj?.firstName || buyerObj?.name || "";
      const lName = buyerObj?.lastName || "";
      const fullName = `${fName} ${lName}`.trim();
      const parsedDate = rev?.createdAt ? new Date(rev.createdAt) : null;
      const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

      return {
        id: rev?.id || String(Math.random()),
        authorName: fullName || (isAr ? "عميل" : "Customer"),
        authorAvatarUrl: buyerObj?.image || buyerObj?.avatarUrl || undefined,
        date: isValidDate
          ? parsedDate.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "",
        rating: Number(rev?.rating) || 0,
        title:
          rev?.title || `${isAr ? "التقييم" : "Rating"}: ${rev?.rating || 0}/5`,
        body: rev?.comment || rev?.body || "",
        photoUrls: Array.isArray(rev?.photos || rev?.photoUrls || rev?.images)
          ? (rev?.photos || rev?.photoUrls || rev?.images)
              .map((img: any) => (typeof img === "string" ? img : img?.url))
              .filter(Boolean)
          : undefined,
      };
    });
  }, [rawReviewsList, isAr]);

  const filteredReviews = useMemo(() => {
    let result = [...mappedReviews];

    if (activeFilter === "5") {
      result = result.filter((r) => r.rating === 5);
    } else if (activeFilter === "4") {
      result = result.filter((r) => r.rating === 4);
    } else if (activeFilter === "3") {
      result = result.filter((r) => r.rating === 3);
    } else if (activeFilter === "2") {
      result = result.filter((r) => r.rating === 2);
    } else if (activeFilter === "1") {
      result = result.filter((r) => r.rating === 1);
    } else if (activeFilter === "photos") {
      result = result.filter(
        (r) => Array.isArray(r.photoUrls) && r.photoUrls.length > 0
      );
    } else if (activeFilter === "newest") {
      result.sort((a, b) => {
        const tA = a.date ? new Date(a.date).getTime() : 0;
        const tB = b.date ? new Date(b.date).getTime() : 0;
        const safeA = isNaN(tA) ? 0 : tA;
        const safeB = isNaN(tB) ? 0 : tB;
        return safeB - safeA;
      });
    } else if (activeFilter === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [mappedReviews, activeFilter]);

  const reviewsCount = mappedReviews.length;
  let computedAverage = summaryData?.averageRating ?? 0;
  let computedTotal =
    summaryData?.totalReviews ??
    (reviewsData?.pagination?.totalItems ?? reviewsCount);

  let s5 = summaryData?.counts?.stars5 ?? 0;
  let s4 = summaryData?.counts?.stars4 ?? 0;
  let s3 = summaryData?.counts?.stars3 ?? 0;
  let s2 = summaryData?.counts?.stars2 ?? 0;
  let s1 = summaryData?.counts?.stars1 ?? 0;

  if (computedTotal === 0 && reviewsCount > 0) {
    computedTotal = reviewsCount;
    s5 = mappedReviews.filter((r) => r.rating === 5).length;
    s4 = mappedReviews.filter((r) => r.rating === 4).length;
    s3 = mappedReviews.filter((r) => r.rating === 3).length;
    s2 = mappedReviews.filter((r) => r.rating === 2).length;
    s1 = mappedReviews.filter((r) => r.rating === 1).length;
    const sumRating = mappedReviews.reduce(
      (acc, r) => acc + (r.rating || 0),
      0
    );
    computedAverage = Number((sumRating / reviewsCount).toFixed(1));
  }

  const ratingCounts: RatingCount[] = [
    { stars: 5, count: s5 },
    { stars: 4, count: s4 },
    { stars: 3, count: s3 },
    { stars: 2, count: s2 },
    { stars: 1, count: s1 },
  ];

  const productName = product
    ? isAr && product.nameAr
      ? product.nameAr
      : product.name
    : isAr
    ? "تفاصيل المنتج"
    : "Product Details";

  const handleToggleStatus = (pDetail: SingleAdminProductDetail) => {
    const isActive = Boolean(pDetail.isActive && !pDetail.isDisabled);
    if (isActive) {
      openDisableModal({
        id: pDetail.id,
        name: pDetail.name,
        nameAr: pDetail.nameAr || undefined,
        vendor: pDetail.vendor?.storeName || '',
        category: pDetail.category?.name || '',
        price: pDetail.variants?.[0]?.price || 0,
        isActive: true,
        image: pDetail.images?.[0]?.url || '',
      });
    } else {
      statusMutation.mutate({ id: pDetail.id, isActive: true });
    }
  };

  const handleConfirmDisable = () => {
    if (modal.product) {
      statusMutation.mutate({ id: modal.product.id, isActive: false });
    }
  };

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
              <Link
                to="/products"
                className="hover:text-black transition-colors"
              >
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
              {isAr
                ? "جاري تحميل تفاصيل المنتج..."
                : "Loading product details..."}
            </span>
          </div>
        ) : isError || (!product && productId) ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <p className="text-base font-semibold text-gray-800 mb-1">
              {isAr
                ? "فشل تحميل تفاصيل المنتج"
                : "Failed to load product details"}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {isAr
                ? "يرجى التحقق من الرقم التعريفي للمنتج والمحاولة مرة أخرى."
                : "Please check the product ID and try again."}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
            >
              {isAr ? "العودة لقائمة المنتجات" : "Back to Products"}
            </Link>
          </div>
        ) : (
          <>
            <ProductInfo
              productDetail={product}
              averageRating={computedAverage}
              totalReviews={computedTotal}
              onToggleStatus={handleToggleStatus}
            />

            <ProductRating
              averageRating={computedAverage}
              totalReviews={computedTotal}
              counts={ratingCounts}
            />

            <ReviewsList
              reviews={filteredReviews}
              totalReviews={filteredReviews.length}
              page={page}
              totalPages={Math.max(1, Math.ceil(filteredReviews.length / 10))}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onPageChange={setPage}
              onDelete={handleDeleteReview}
            />
          </>
        )}
      </div>

      {/* Disable Product Confirmation Modal */}
      <ProductDisableModal
        isOpen={modal.open}
        product={modal.product}
        onClose={closeDisableModal}
        onConfirm={handleConfirmDisable}
      />

      {/* Delete Review Modal */}
      <DeleteReviewModal
        isOpen={Boolean(reviewToDeleteId)}
        onClose={() => setReviewToDeleteId(null)}
        onConfirm={() => {
          if (reviewToDeleteId) {
            deleteMutation.mutate(reviewToDeleteId);
          }
        }}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
};


export default ProductDetails;