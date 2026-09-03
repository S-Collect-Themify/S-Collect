import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getReviewsList, deleteReviewApi, type BackendReviewItem } from '../../services/reviews';
import { getAdminProducts, getAdminVendors } from '../../services/products';
import { useReviewStore } from './reviewStore';
import type { ReviewItem } from './types';

const getVendorDisplayName = (vendorObj: any, isAr: boolean = false): string | null => {
  if (!vendorObj) return null;
  if (typeof vendorObj === 'string' && vendorObj.trim() && vendorObj !== '—') {
    return vendorObj.trim();
  }
  if (typeof vendorObj === 'object') {
    if (isAr && vendorObj.storeNameAr) return vendorObj.storeNameAr;
    if (vendorObj.storeName) return vendorObj.storeName;
    if (isAr && vendorObj.vendorStoreNameAr) return vendorObj.vendorStoreNameAr;
    if (vendorObj.vendorStoreName) return vendorObj.vendorStoreName;
    if (isAr && vendorObj.businessNameAr) return vendorObj.businessNameAr;
    if (vendorObj.businessName) return vendorObj.businessName;
    if (isAr && vendorObj.nameAr) return vendorObj.nameAr;
    if (vendorObj.name) return vendorObj.name;
    if (isAr && vendorObj.vendorNameAr) return vendorObj.vendorNameAr;
    if (vendorObj.vendorName) return vendorObj.vendorName;
    if (vendorObj.owner) return vendorObj.owner;
    if (vendorObj.firstName || vendorObj.lastName) {
      const full = `${vendorObj.firstName || ''} ${vendorObj.lastName || ''}`.trim();
      if (full) return full;
    }
  }
  return null;
};

export const mapBackendReviewToFrontend = (
  r: BackendReviewItem,
  productsList: any[] = [],
  vendorsList: any[] = [],
  language: string = 'en'
): ReviewItem | null => {
  const isAr = language === 'ar';
  const rawDate = r.createdAt || r.updatedAt;
  const formattedDate = rawDate ? String(rawDate).split('T')[0] : '—';

  const revId = `REV-${String(r.id).slice(0, 6)}`;

  // ── Lookup Product by productId in productsList or embedded in review ──
  const targetProdId =
    r.productId ||
    (r as any).product_id ||
    (typeof (r as any).product === 'string' ? (r as any).product : (r as any).product?.id || (r as any).product?._id);

  let productName = '';

  const matchedProd = productsList.find((p: any) => {
    const pId = p.id || p._id || p.productId;
    return (
      pId &&
      targetProdId &&
      String(pId).trim().toLowerCase() === String(targetProdId).trim().toLowerCase()
    );
  });

  const rawProduct = (r as any).product;

  if (matchedProd) {
    productName = isAr
      ? matchedProd.nameAr || matchedProd.name || matchedProd.titleAr || matchedProd.title
      : matchedProd.name || matchedProd.nameAr || matchedProd.title || matchedProd.titleAr;
  } else if (
    rawProduct &&
    typeof rawProduct === 'object' &&
    (rawProduct.name || rawProduct.nameAr || rawProduct.title || rawProduct.titleAr)
  ) {
    productName = isAr
      ? rawProduct.nameAr || rawProduct.name || rawProduct.titleAr || rawProduct.title
      : rawProduct.name || rawProduct.nameAr || rawProduct.title || rawProduct.titleAr;
  } else if ((r as any).productName) {
    productName = (r as any).productName;
  }

  // If the product name was not found but targetProdId exists, use fallback title instead of dropping row
  if (!productName || !productName.trim() || productName === '—') {
    if (targetProdId) {
      productName = `Product (${String(targetProdId).slice(0, 8)})`;
    } else {
      return null;
    }
  }

  // ── Lookup Vendor by vendorId in vendorsList or embedded in review/product ──
  let vendorName: string | null = null;

  // 1. Check matched product for vendor object or store name
  if (matchedProd) {
    if (isAr && matchedProd.vendorStoreNameAr) vendorName = matchedProd.vendorStoreNameAr;
    else if (matchedProd.vendorStoreName) vendorName = matchedProd.vendorStoreName;
    else if (isAr && matchedProd.vendorNameAr) vendorName = matchedProd.vendorNameAr;
    else if (matchedProd.vendorName) vendorName = matchedProd.vendorName;
    else if (matchedProd.vendor) vendorName = getVendorDisplayName(matchedProd.vendor, isAr);
  }

  // 2. Check embedded rawProduct on review
  if (!vendorName && rawProduct && typeof rawProduct === 'object') {
    if (isAr && rawProduct.vendorStoreNameAr) vendorName = rawProduct.vendorStoreNameAr;
    else if (rawProduct.vendorStoreName) vendorName = rawProduct.vendorStoreName;
    else if (isAr && rawProduct.vendorNameAr) vendorName = rawProduct.vendorNameAr;
    else if (rawProduct.vendorName) vendorName = rawProduct.vendorName;
    else if (rawProduct.vendor) vendorName = getVendorDisplayName(rawProduct.vendor, isAr);
  }

  // 3. Check review item direct properties
  if (!vendorName && (r as any).vendor) {
    vendorName = getVendorDisplayName((r as any).vendor, isAr);
  }
  if (!vendorName && ((r as any).vendorStoreName || (r as any).vendorName)) {
    vendorName = isAr
      ? (r as any).vendorStoreNameAr || (r as any).vendorNameAr || (r as any).vendorStoreName || (r as any).vendorName
      : (r as any).vendorStoreName || (r as any).vendorName;
  }

  // 4. Lookup in vendorsList by vendorId
  const possibleVendorId =
    matchedProd?.vendorId ||
    matchedProd?.vendor_id ||
    matchedProd?.vendor?.id ||
    matchedProd?.vendor?._id ||
    rawProduct?.vendorId ||
    rawProduct?.vendor_id ||
    rawProduct?.vendor?.id ||
    rawProduct?.vendor?._id ||
    (r as any).vendorId ||
    (r as any).vendor_id ||
    (typeof (r as any).vendor === 'string' ? (r as any).vendor : null);

  if (!vendorName && possibleVendorId && vendorsList.length > 0) {
    const targetVId = String(possibleVendorId).trim().toLowerCase();
    const matchedVendor = vendorsList.find((v: any) => {
      const candidateId = v.id || v._id || v.vendorId;
      return candidateId && String(candidateId).trim().toLowerCase() === targetVId;
    });

    if (matchedVendor) {
      vendorName = getVendorDisplayName(matchedVendor, isAr);
    }
  }

  const finalVendorName = vendorName && vendorName.trim() && vendorName !== '—' ? vendorName.trim() : '—';
  const buyer = `${r.buyer?.firstName || ''} ${r.buyer?.lastName || ''}`.trim() || '—';

  return {
    id: r.id,
    reviewId: revId,
    product: productName,
    productId: targetProdId || r.productId,
    buyerName: buyer,
    buyerAccountId: r.buyer?.id,
    vendor: finalVendorName,
    rating: Number(r.rating) || 0,
    comment: r.comment || '',
    date: formattedDate,
    createdAt: rawDate ? String(rawDate) : undefined,
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
        const fetchParams = { pageSize: 100, pageNum: 1, page: 1, limit: 100 };
        const [reviewsRes, productsRes, vendorsRes] = await Promise.allSettled([
          getReviewsList(fetchParams),
          getAdminProducts(fetchParams),
          getAdminVendors(),
        ]);

        const response = reviewsRes.status === 'fulfilled' ? reviewsRes.value : null;
        const productsResponse = productsRes.status === 'fulfilled' ? productsRes.value : null;
        const vendorsResponse = vendorsRes.status === 'fulfilled' ? vendorsRes.value : null;

        const itemsArray = extractReviewsArray(response);
        const productsList = extractProductsArray(productsResponse);
        const vendorsList = extractVendorsArray(vendorsResponse);

        const mapped: ReviewItem[] = itemsArray
          .map((r) =>
            mapBackendReviewToFrontend(r, productsList, vendorsList, i18n.language)
          )
          .filter((r): r is ReviewItem => r !== null);

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
