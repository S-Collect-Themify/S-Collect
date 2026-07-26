import { ChevronsRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import ProductInfo from '../features/AddProducts/productDetails/ProductInfo';
import ProductRating, {
  type RatingCount,
} from '../features/AddProducts/productDetails/ProductRating';
import ReviewsList, {
  type Review,
  type ReviewFilter,
} from '../features/AddProducts/productDetails/ReviewsList';

import { useProductDetails } from '../features/AddProducts/productDetails/useProductDetails';
import { useCategories } from '../hooks/useCategories';

const ratingCounts: RatingCount[] = [
  { stars: 5, count: 128 },
  { stars: 4, count: 54 },
  { stars: 3, count: 18 },
  { stars: 2, count: 6 },
  { stars: 1, count: 4 },
];

const reviews: Review[] = [
  {
    id: 'rev-1',
    authorName: 'Mona Alharbi',
    date: '2026-07-12',
    rating: 5,
    title: 'Great quality and fast delivery',
    body: 'The product matched the description exactly and arrived earlier than expected.',
    photoUrls: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    ],
  },
  {
    id: 'rev-2',
    authorName: 'Ahmed Saleh',
    date: '2026-07-10',
    rating: 4,
    title: 'Very good overall',
    body: 'Works well and the packaging was solid. I would buy it again for sure.',
  },
  {
    id: 'rev-3',
    authorName: 'Sara Mohammed',
    date: '2026-07-08',
    rating: 5,
    title: 'Perfect for daily use',
    body: 'I have been using it every day for a week and it has been reliable so far.',
  },
];

const ProductDetails = () => {
  const { i18n } = useTranslation();
  const { id = '' } = useParams();

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

  if (productLoading || categoriesLoading) {
    return <div>Loading...</div>;
  }

  if (productError) {
    return <div>Error: {productError.message}</div>;
  }

  if (categoriesError) {
    return <div>Error: {categoriesError.message}</div>;
  }

  const product = data?.data;

  if (!product) {
    return <div>Product not found</div>;
  }

  const variant = product.variants[0];

  const category = categories.find((c: any) => c.id === product.categoryId);

  const productName = i18n.language === 'ar' ? product.nameAr : product.name;

  const categoryName =
    i18n.language === 'ar' ? category?.nameAr : category?.name;

  const activeFilter: ReviewFilter = 'all';

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
          images={product.images}
          name={productName}
          category={categoryName ?? '-'}
          brand="-"
          sku={variant?.sku ?? '-'}
          price={variant?.price ?? 0}
          compareAtPrice={variant?.compareAtPrice ?? undefined}
          cost={undefined}
          currency="SAR"
          inStock={(variant?.stock ?? 0) > 0}
          stockCount={variant?.stock ?? 0}
          averageRating={4.7}
          totalReviews={206}
        />

        <ProductRating
          averageRating={4.7}
          totalReviews={206}
          counts={ratingCounts}
        />

        <ReviewsList
          reviews={reviews}
          totalReviews={206}
          page={1}
          totalPages={1}
          activeFilter={activeFilter}
        />
      </div>
    </>
  );
};

export default ProductDetails;
