import { api, handleServiceError } from './api';
import { generateProductImportTemplate } from '../utils/productImportTemplateGenerator';
import { sanitizeProductImportFile } from '../utils/productImportSanitizer';

export const getAllProducts = async () => {
  try {
    const { data } = await api.post('/vendor/products/search', {
      pageNum: 1,
      pageSize: 100,
    });

    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;

    return unwrapped;
  } catch (err) {
    try {
      const { data } = await api.get('/vendor/products');
      return data;
    } catch {
      return {
        items: [],
        pagination: {
          currentPage: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
      };
    }
  }
};

export const getProductById = async (productId: string) => {
  try {
    const { data } = await api.get(`/vendor/products/${productId}`);
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to fetch product ${productId}`);
  }
};

export interface UpdateProductPayload {
  name?: string;
  nameAr?: string;
  categoryId?: string;
  description?: string;
  descriptionAr?: string;
}

export const updateProductFull = async (
  productId: string,
  payload: UpdateProductPayload | FormData
) => {
  try {
    let body: any = payload;
    if (payload instanceof FormData) {
      const jsonBody: Record<string, any> = {};
      const name = payload.get('name') || payload.get('nameEn');
      const nameAr = payload.get('nameAr');
      const categoryId = payload.get('categoryId');
      const description = payload.get('description');
      const descriptionAr = payload.get('descriptionAr');

      if (name) jsonBody.name = String(name);
      if (nameAr) jsonBody.nameAr = String(nameAr);
      if (categoryId) jsonBody.categoryId = String(categoryId);
      if (description !== null && description !== undefined)
        jsonBody.description = String(description);
      if (descriptionAr !== null && descriptionAr !== undefined)
        jsonBody.descriptionAr = String(descriptionAr);

      body = jsonBody;
    }

    const { data } = await api.patch(`/vendor/products/${productId}`, body);
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to update product ${productId}`);
  }
};

export const createProductFull = async (formData: FormData) => {
  try {
    const { data } = await api.post('/vendor/products/full', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to create product');
  }
};

export const setProductThumbnail = async (
  productId: string,
  imageId: string
) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}/images/${imageId}/thumbnail`
    );
    return data;
  } catch (err: unknown) {
    const serviceErr = handleServiceError(
      err,
      'Failed to set product thumbnail'
    );
    if (serviceErr.statusCode === 404 || serviceErr.statusCode === 405) {
      try {
        const { data } = await api.put(
          `/vendor/products/${productId}/images/${imageId}/thumbnail`
        );
        return data;
      } catch (putErr: unknown) {
        try {
          const { data } = await api.post(
            `/vendor/products/${productId}/images/${imageId}/thumbnail`
          );
          return data;
        } catch (postErr: unknown) {
          throw handleServiceError(
            postErr,
            'All thumbnail methods failed (PATCH, PUT, POST)'
          );
        }
      }
    }
    throw serviceErr;
  }
};

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description?: string | null;
  parentCategoryId?: string | null;
  isActive: boolean;
  image?: string | null;
  productCount?: number;
  createdAt: string;
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await api.get('/vendor/categories');
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch categories');
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vendor/categories/${id}`);
  } catch (err) {
    throw handleServiceError(err, `Failed to delete category ${id}`);
  }
};

export interface ProductOptionValueBody {
  value: string;
  valueAr: string;
}

export interface CreateProductOptionBody {
  name: string;
  nameAr: string;
  values: ProductOptionValueBody[];
}

export const createProductOption = async (
  productId: string,
  body: CreateProductOptionBody
) => {
  try {
    const { data } = await api.post(
      `/vendor/products/${productId}/options`,
      body
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to create option for ${productId}`);
  }
};

export const addProductOptionValue = async (
  productId: string,
  optionId: string,
  body: ProductOptionValueBody
) => {
  try {
    const { data } = await api.post(
      `/vendor/products/${productId}/options/${optionId}/values`,
      body
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to add option value for ${optionId}`);
  }
};

export const deleteProductOptionValue = async (
  productId: string,
  optionId: string,
  valueId: string
) => {
  try {
    const { data } = await api.delete(
      `/vendor/products/${productId}/options/${optionId}/values/${valueId}`
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to delete option value ${valueId}`);
  }
};

export interface CreateProductVariantBody {
  optionValueIds: string[];
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface UpdateProductVariantBody {
  price?: number;
  compareAtPrice?: number;
  stock?: number;
  isActive?: boolean;
}

export const createProductVariant = async (
  productId: string,
  body: CreateProductVariantBody
) => {
  const url = `/vendor/products/${productId}/variants`;
  console.log('Create product variant request:', {
    method: 'POST',
    url,
    body,
  });

  try {
    const { data } = await api.post(url, body);
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to create variant for ${productId}`);
  }
};

export const updateProductVariant = async (
  productId: string,
  variantId: string,
  body: UpdateProductVariantBody
) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}/variants/${variantId}`,
      body
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to update variant ${variantId}`);
  }
};

export const deleteProductImage = async (
  productId: string,
  imageId: string
) => {
  try {
    const { data } = await api.delete(
      `/vendor/products/${productId}/images/${imageId}`
    );
    return data;
  } catch (err) {
    throw handleServiceError(err, `Failed to delete product image ${imageId}`);
  }
};

export const uploadProductImage = async (productId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(
      `/vendor/products/${productId}/images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;

    return unwrapped;
  } catch (err) {
    throw handleServiceError(
      err,
      `Failed to upload product image for product ${productId}`
    );
  }
};

export const searchVendorProducts = async (query: {
  pageNum?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  inStockOrAbove?: number;
}) => {
  try {
    const { data } = await api.post('/vendor/products/search', query);
    const unwrapped =
      data && typeof data === 'object' && 'success' in data && 'data' in data
        ? (data as any).data
        : data;
    return unwrapped;
  } catch (err) {
    throw handleServiceError(err, 'Failed to search vendor products');
  }
};

export const bulkUpdateProductStatus = async (params: {
  productIds: string[];
  status: 'PUBLISH' | 'UNPUBLISH';
}) => {
  try {
    const { data } = await api.post('/vendor/products/bulk-status', params);
    return data;
  } catch (err) {
    throw handleServiceError(err, 'Failed to bulk update product status');
  }
};

export const activateProduct = async (productId: string) => {
  try {
    const { data } = await api.patch(`/vendor/products/${productId}/activate`);
    return data;
  } catch (err) {
    const serviceErr = handleServiceError(err);
    if (serviceErr.statusCode === 404 || serviceErr.statusCode === 405) {
      const { data } = await api.post(`/vendor/products/${productId}/activate`);
      return data;
    }
    throw serviceErr;
  }
};

export const deactivateProduct = async (productId: string) => {
  try {
    const { data } = await api.patch(
      `/vendor/products/${productId}/deactivate`
    );
    return data;
  } catch (err) {
    const serviceErr = handleServiceError(err);
    if (serviceErr.statusCode === 404 || serviceErr.statusCode === 405) {
      const { data } = await api.post(
        `/vendor/products/${productId}/deactivate`
      );
      return data;
    }
    throw serviceErr;
  }
};

export interface ProductImportFailedItem {
  rows: number[];
  product?: string;
  error?: string;
}

export interface ProductImportResponse {
  created: number;
  failed: ProductImportFailedItem[];
  summary: string;
}

/**
 * Download product import Excel template (.xlsx):
 * 1. Attempts to fetch the official template directly from the backend (GET /vendor/products/import/template)
 * 2. Falls back to generating the template locally with ExcelJS if server is offline or returns error
 */
export const downloadProductImportTemplate = async (): Promise<Blob> => {
  try {
    let blob: Blob;

    try {
      const response = await api.get('/vendor/products/import/template', {
        responseType: 'blob',
      });
      blob = new Blob([response.data], {
        type:
          (response.headers['content-type'] as string) ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (serverErr) {
      console.warn(
        'Server template download failed, falling back to local generator:',
        serverErr
      );
      let categories: Category[] = [];
      try {
        categories = await getCategories();
      } catch {
        categories = [];
      }
      blob = await generateProductImportTemplate(categories);
    }

    // Trigger direct browser download
    const filename = 'products_import_template.xlsx';
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (err) {
    throw handleServiceError(err, 'Failed to download products template');
  }
};

/**
 * Upload and import products from a filled .xlsx template
 */
export const importProducts = async (
  file: File
): Promise<ProductImportResponse> => {
  try {
    const cleanFile = await sanitizeProductImportFile(file);
    const formData = new FormData();
    formData.append('file', cleanFile);

    const { data } = await api.post('/vendor/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const unwrapped: ProductImportResponse =
      data && typeof data === 'object' && 'data' in data
        ? (data as any).data
        : data;

    return unwrapped;
  } catch (err) {
    throw handleServiceError(err, 'Failed to import products');
  }
};

export interface ExportProductsParams {
  categoryId?: string;
  isActive?: boolean;
}

/**
 * Export vendor products as Excel (.xlsx) file and trigger browser download
 */
export const exportProducts = async (
  params?: ExportProductsParams
): Promise<Blob> => {
  try {
    const cleanParams: Record<string, any> = {};
    if (params?.categoryId) cleanParams.categoryId = params.categoryId;
    if (params?.isActive !== undefined) cleanParams.isActive = params.isActive;

    const response = await api.get('/vendor/products/export', {
      params: cleanParams,
      responseType: 'blob',
    });

    const contentType =
      typeof response.headers['content-type'] === 'string'
        ? response.headers['content-type']
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    const blob = new Blob([response.data as BlobPart], {
      type: contentType,
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `products_export_${dateStr}.xlsx`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    return blob;
  } catch (err) {
    throw handleServiceError(err, 'Failed to export products');
  }
};


