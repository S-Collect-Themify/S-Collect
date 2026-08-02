import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getReviewsList, deleteReviewApi, type BackendReviewItem } from '../../services/reviews';
import { getAdminProducts, getAdminVendors } from '../../services/products';
import { useReviewStore } from './reviewStore';
import type { ReviewItem } from './types';

const getVendorDisplayName = (vendorObj: any): string => {
  if (!vendorObj) return '—';
  if (typeof vendorObj === 'string') return vendorObj;
  if (vendorObj.storeName) return vendorObj.storeName;
  if (vendorObj.name) return vendorObj.name;
  if (vendorObj.firstName || vendorObj.lastName) {
    return `${vendorObj.firstName || ''} ${vendorObj.lastName || ''}`.trim();
  }
  return String(vendorObj.id || '—');
};

export const mapBackendReviewToFrontend = (
  r: BackendReviewItem,
  productsList: any[] = [],
  vendorsList: any[] = [],
  language: string = 'en'
): ReviewItem => {
  const formattedDate = r.updatedAt ? String(r.updatedAt).split('T')[0] : '—';

  const revId = `REV-${String(r.id).slice(0, 6)}`;

  // ── Lookup Product by productId in productsList ──
  let productName = '—';
  let productVendorId: string | null = null;

  const matchedProd = productsList.find(
    (p: any) => String(p.id || p._id).toLowerCase() === String(r.productId).toLowerCase()
  );
  if (matchedProd) {
    productName =
      language === 'ar'
        ? matchedProd.nameAr || matchedProd.name
        : matchedProd.name || matchedProd.nameAr;
    productVendorId = matchedProd.vendorId || matchedProd.vendor?.id || null;
  } else if (r.productId) {
    productName = `Product (${String(r.productId).slice(0, 8)}...)`;
  }

  // ── Lookup Vendor by vendorId in vendorsList ──
  let vendorName = '—';

  if (productVendorId) {
    const matchedVendor = vendorsList.find(
      (v: any) => String(v.id || v._id).toLowerCase() === String(productVendorId).toLowerCase()
    );
    vendorName = matchedVendor
      ? getVendorDisplayName(matchedVendor)
      : `Vendor (${String(productVendorId).slice(0, 8)}...)`;
  }

  const buyer = `${r.buyer?.firstName || ''} ${r.buyer?.lastName || ''}`.trim() || '—';

  return {
    id: r.id,
    reviewId: revId,
    product: productName,
    productId: r.productId,
    buyerName: buyer,
    buyerAccountId: r.buyer?.id,
    vendor: vendorName,
    rating: Number(r.rating) || 0,
    comment: r.comment || '',
    date: formattedDate,
  };
};

const extractReviewsArray = (response: any): BackendReviewItem[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.reviews)) return response.reviews;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data.reviews)) return response.data.reviews;
    }
    if (Array.isArray(response.result)) return response.result;
    if (Array.isArray(response.content)) return response.content;
  }
  return [];
};

const extractProductsArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.products)) return response.products;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
    }
  }
  return [];
};

const extractVendorsArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') {
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.vendors)) return response.vendors;
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data.vendors)) return response.data.vendors;
    }
  }
  return [];
};

export const useReviewsData = () => {
  const queryClient = useQueryClient();
  const { i18n } = useTranslation();
  const setReviews = useReviewStore((s) => s.setReviews);
  const removeReviewFromStore = useReviewStore((s) => s.removeReview);
  const closeDeleteModal = useReviewStore((s) => s.closeDeleteModal);

  // ── Fetch Reviews, Products & Vendors Query ──
  const reviewsQuery = useQuery({
    queryKey: ['admin-reviews', i18n.language],
    queryFn: async () => {
      try {
        const [reviewsRes, productsRes, vendorsRes] = await Promise.allSettled([
          getReviewsList(),
          getAdminProducts(),
          getAdminVendors(),
        ]);

        const response = reviewsRes.status === 'fulfilled' ? reviewsRes.value : null;
        const productsResponse = productsRes.status === 'fulfilled' ? productsRes.value : null;
        const vendorsResponse = vendorsRes.status === 'fulfilled' ? vendorsRes.value : null;

        const itemsArray = extractReviewsArray(response);
        const productsList = extractProductsArray(productsResponse);
        const vendorsList = extractVendorsArray(vendorsResponse);

        const mapped: ReviewItem[] = itemsArray.map((r) =>
          mapBackendReviewToFrontend(r, productsList, vendorsList, i18n.language)
        );

        setReviews(mapped);
        return mapped;
      } catch (e) {
        console.warn('Reviews API fetch failed:', e);
        setReviews([]);
        return [];
      }
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // ── Delete Review Mutation (Hard Delete) ──
  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      return await deleteReviewApi(reviewId);
    },
    onMutate: (reviewId: string) => {
      removeReviewFromStore(reviewId);
      closeDeleteModal();
    },
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => {
      toast.error('Failed to delete review');
    },
  });

  return {
    reviewsQuery,
    deleteMutation,
  };
};
