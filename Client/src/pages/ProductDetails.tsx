import React, { useState, useMemo } from 'react';
import { ChevronsRight, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '../types/api';

import ProductInfo from '../features/AddProducts/productDetails/ProductInfo';
import ProductRating, {
  type RatingCount,
} from '../features/AddProducts/productDetails/ProductRating';
import ReviewsList, {
  type Review,
  type ReviewFilter,
} from '../features/AddProducts/productDetails/ReviewsList';
import ProductDetailsSkeleton from '../features/AddProducts/productDetails/ProductDetailsSkeleton';

import { useProductDetails } from '../features/AddProducts/productDetails/useProductDetails';
import { useCategories } from '../hooks/useCategories';
import { getVendorReviews, getProductRatingSummary } from '../services/reviews';

const ProductDetails = () => {
  const { i18n } = useTranslation();
  const { id: rawId = '' } = useParams();
  const id = useMemo(() => {
    const decoded = decodeURIComponent(rawId || '').trim();
    // Normalize spaces in UUIDs if spaces were used instead of hyphens
    if (decoded.includes(' ') && !decoded.includes('-')) {
      return decoded.replace(/\s+/g, '-');
    }
    return decoded;
  }, [rawId]);

  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');

  const {
    data,
    error: productError,
    isLoading: productLoading,
  } = useProductDetails(id);

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  const { data: summaryData } = useQuery({
    queryKey: ['product-rating-summary', id],
    queryFn: () => getProductRatingSummary(id),
    enabled: Boolean(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => getVendorReviews({ productId: id }),
    enabled: Boolean(id),
  });

  const reviewsList = useMemo(
    () => (Array.isArray(reviewsData?.items) ? reviewsData.items : []),
    [reviewsData?.items]
  );

  const mappedReviews: Review[] = useMemo(() => {
    return reviewsList.map((rev) => {
      const fName = rev?.buyer?.firstName || '';
      const lName = rev?.buyer?.lastName || '';
      const fullName = `${fName} ${lName}`.trim();
      const parsedDate = rev?.createdAt ? new Date(rev.createdAt) : null;
      const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

      return {
        id: rev?.id || Math.random().toString(),
        authorName: fullName || 'Customer',
        date: isValidDate
          ? parsedDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
        rating: rev?.rating || 0,
        title: `Rating: ${rev?.rating || 0}/5`,
        body: rev?.comment || '',
      };
    });
  }, [reviewsList]);

  const filteredReviews = useMemo(() => {
    let result = [...mappedReviews];

    if (activeFilter === '5') {
      result = result.filter((r) => r.rating === 5);
    } else if (activeFilter === '4') {
      result = result.filter((r) => r.rating === 4);
    } else if (activeFilter === '3') {
      result = result.filter((r) => r.rating === 3);
    } else if (activeFilter === '2') {
      result = result.filter((r) => r.rating === 2);
    } else if (activeFilter === '1') {
      result = result.filter((r) => r.rating === 1);
    } else if (activeFilter === 'photos') {
      result = result.filter(
        (r) => Array.isArray(r.photoUrls) && r.photoUrls.length > 0
      );
    } else if (activeFilter === 'newest') {
      result.sort((a, b) => {
        const tA = a.date ? new Date(a.date).getTime() : 0;
        const tB = b.date ? new Date(b.date).getTime() : 0;
        const safeA = isNaN(tA) ? 0 : tA;
        const safeB = isNaN(tB) ? 0 : tB;
        return safeB - safeA;
      });
    } else if (activeFilter === 'highest') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (activeFilter === 'lowest') {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [mappedReviews, activeFilter]);

  if (productLoading || categoriesLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (productError) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold text-lg">
          {getErrorMessage(productError, 'Failed to load product details')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/management')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Management
        </button>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold text-lg">
          {getErrorMessage(categoriesError, 'Failed to load categories')}
        </p>
      </div>
    );
  }

  const product =
    data && typeof data === 'object' && 'data' in data && (data as any).data
      ? (data as any).data
      : data;

  const isValidProduct =
    product &&
    typeof product === 'object' &&
    (Boolean(product.id) || Boolean(product.name) || Boolean(product.nameAr));

  if (!isValidProduct) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-gray-500 font-semibold text-lg">Product not found</p>
        <button
          type="button"
          onClick={() => navigate('/management')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Management
        </button>
      </div>
    );
  }

  const variant = Array.isArray(product.variants)
    ? product.variants[0]
    : undefined;
  const categoryList = Array.isArray(categories) ? categories : [];
  const category = categoryList.find(
    (c: any) => c && c.id === product.categoryId
  );

  const productName =
    (i18n.language === 'ar' ? product.nameAr : product.name) ||
    product.name ||
    product.nameAr ||
    'Product';
  const categoryName =
    (i18n.language === 'ar' ? category?.nameAr : category?.name) ||
    category?.name ||
    category?.nameAr ||
    '-';

  const reviewsCount = reviewsList.length;

  let computedAverage = summaryData?.averageRating ?? 0;
  let computedTotal =
    summaryData?.totalReviews ??
    reviewsData?.pagination?.totalItems ??
    reviewsCount;

  let s5 = summaryData?.counts?.stars5 ?? 0;
  let s4 = summaryData?.counts?.stars4 ?? 0;
  let s3 = summaryData?.counts?.stars3 ?? 0;
  let s2 = summaryData?.counts?.stars2 ?? 0;
  let s1 = summaryData?.counts?.stars1 ?? 0;

  // Defensive fallback: if summary endpoint returns 0 but reviews list has items
  if (computedTotal === 0 && reviewsCount > 0) {
    computedTotal = reviewsCount;
    s5 = reviewsList.filter((r) => r && r.rating === 5).length;
    s4 = reviewsList.filter((r) => r && r.rating === 4).length;
    s3 = reviewsList.filter((r) => r && r.rating === 3).length;
    s2 = reviewsList.filter((r) => r && r.rating === 2).length;
    s1 = reviewsList.filter((r) => r && r.rating === 1).length;
    const sumRating = reviewsList.reduce((acc, r) => acc + (r?.rating || 0), 0);
    computedAverage = Number((sumRating / reviewsCount).toFixed(1));
  }

  const ratingCounts: RatingCount[] = [
    { stars: 5, count: s5 },
    { stars: 4, count: s4 },
    { stars: 3, count: s3 },
    { stars: 2, count: s2 },
    { stars: 1, count: s1 },
  ];

  return (
    <>
      <div className="sidebar-page-container-header">
        <h1 className="heading-page-title font-semibold text-[#090909]">
          Product Details
        </h1>

        <nav className="mt-3 flex items-center gap-1 text-sm">
          <span className="text-[#090909]">Product Details</span>

          <span className="text-[#737373]">
            <ChevronsRight size={16} />
          </span>

          <span className="text-[#737373]">{productName}</span>
        </nav>
      </div>

      <div className="sidebar-page-container space-y-8">
        <ProductInfo
          images={
            Array.isArray(product.images) && product.images.length > 0
              ? product.images
              : product.thumbnailUrl
                ? [{ id: '1', url: product.thumbnailUrl, isThumbnail: true }]
                : product.icon && product.icon.startsWith('http')
                  ? [{ id: '1', url: product.icon, isThumbnail: true }]
                  : []
          }
          name={productName}
          description={product.description}
          descriptionAr={product.descriptionAr}
          category={categoryName ?? '-'}
          brand="-"
          sku={variant?.sku ?? product.sku ?? '-'}
          price={
            variant?.price ??
            (typeof product.price === 'number'
              ? product.price
              : typeof product.minPrice === 'number'
                ? product.minPrice
                : typeof product.minPrice === 'object'
                  ? Number(
                      product.minPrice?.amount || product.minPrice?.value || 0
                    )
                  : 0)
          }
          compareAtPrice={
            variant?.compareAtPrice ?? product.compareAtPrice ?? undefined
          }
          cost={undefined}
          currency="SAR"
          inStock={
            (variant?.stock ?? product.stock ?? product.stockCount ?? 0) > 0 ||
            product.isActive === true
          }
          stockCount={
            variant?.stock ?? product.stock ?? product.stockCount ?? 0
          }
          averageRating={computedAverage}
          totalReviews={computedTotal}
          options={Array.isArray(product.options) ? product.options : []}
          variants={Array.isArray(product.variants) ? product.variants : []}
        />

        <ProductRating
          averageRating={computedAverage}
          totalReviews={computedTotal}
          counts={ratingCounts}
        />

        <ReviewsList
          reviews={filteredReviews}
          totalReviews={filteredReviews.length}
          page={reviewsData?.pagination?.currentPage || 1}
          totalPages={reviewsData?.pagination?.totalPages || 1}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>
    </>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ProductDetailsErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProductDetails render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center space-y-4 bg-white rounded-2xl m-6 border border-red-100 shadow-sm">
          <h2 className="text-xl font-bold text-red-600">
            Product Details Render Exception
          </h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto font-mono bg-red-50 p-3 rounded-lg text-left overflow-x-auto">
            {this.state.error?.message ||
              'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/management')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Management
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function SafeProductDetails() {
  return (
    <ProductDetailsErrorBoundary>
      <ProductDetails />
    </ProductDetailsErrorBoundary>
  );
}
