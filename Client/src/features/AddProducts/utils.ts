import type {
  ProductFormData,
  RawProductResponse,
  ProductOptionValue,
  OptionMeta,
  VariantMeta,
  ExistingImage,
} from './types';

export const urlToFile = async (
  url: string,
  filename: string
): Promise<File | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/jpeg' });
  } catch (err) {
    console.error('Failed to convert URL to File:', url, err);
    return null;
  }
};

/**
 * Pure utility function to extract product thumbnail URL from API response or fallback File object.
 */
export const getProductThumbnail = (
  response: unknown,
  fallbackImageFile?: File
): string | undefined => {
  if (response && typeof response === 'object') {
    const resObj = response as Record<string, unknown>;
    if (Array.isArray(resObj.images)) {
      const thumbnailImg = resObj.images.find(
        (img) => img && typeof img === 'object' && 'isThumbnail' in img && Boolean(img.isThumbnail)
      ) as { url?: string } | undefined;

      if (thumbnailImg?.url) return thumbnailImg.url;
      const firstImg = resObj.images[0] as { url?: string } | undefined;
      if (firstImg?.url) return firstImg.url;
    }
    if (typeof resObj.thumbnailUrl === 'string') {
      return resObj.thumbnailUrl;
    }
  }

  if (fallbackImageFile) {
    return URL.createObjectURL(fallbackImageFile);
  }

  return undefined;
};

export const mapProductToFormData = async (
  product: unknown
): Promise<ProductFormData> => {
  // Unwrap if the response is in a { success: boolean, data: T } envelope
  const raw: RawProductResponse =
    product &&
    typeof product === 'object' &&
    'success' in product &&
    'data' in product
      ? (product as { data: RawProductResponse }).data
      : (product as RawProductResponse) || {};

  const sizes: string[] = [];
  const colors: string[] = [];
  const optionsMeta: OptionMeta[] = [];

  if (Array.isArray(raw.options)) {
    for (const option of raw.options) {
      const optionName = (option.name || '').toLowerCase();
      const meta: OptionMeta = {
        id: option.id || '',
        name: option.name || '',
        nameAr: option.nameAr || '',
        values: (option.values || []).map((v: ProductOptionValue) => ({
          id: v.id || '',
          value: v.value || v.valueAr || '',
          valueAr: v.valueAr || v.value || '',
        })),
      };
      optionsMeta.push(meta);

      if (optionName === 'size' || optionName === 'المقاس') {
        option.values?.forEach((v: ProductOptionValue) => {
          const val = v.value || v.valueAr || '';
          if (val) sizes.push(val);
        });
      } else if (optionName === 'color' || optionName === 'اللون') {
        option.values?.forEach((v: ProductOptionValue) => {
          const val = v.value || v.valueAr || '';
          if (val) colors.push(val);
        });
      }
    }
  }

  const firstVariant = raw.variants?.[0];

  let quantity = 0;
  if (Array.isArray(raw.variants)) {
    quantity = raw.variants.reduce(
      (sum: number, v) => sum + (v.stock ?? 0),
      0
    );
  }

  // Preserve real variant IDs matched by their option value combination
  const variantsMeta: VariantMeta[] = (raw.variants || []).map((v) => ({
    id: v.id || '',
    optionValueIds: (v.optionValues || []).map(
      (ov: any) => ov.valueId || ''
    ),
  }));

  // Store existing images with their real IDs (don't re-upload them)
  const existingImages: ExistingImage[] = (raw.images || [])
    .filter((img) => img.url)
    .map((img) => ({
      id: img.id || '',
      url: img.url || '',
      isThumbnail: Boolean(img.isThumbnail),
    }));

  return {
    nameAr: raw.nameAr || raw.name || '',
    nameEn: raw.nameEn || raw.name || '',
    description: raw.description || raw.descriptionAr || '',
    basePrice: firstVariant?.price?.toString() ?? '',
    comparePrice: firstVariant?.compareAtPrice?.toString() ?? '',
    sku: firstVariant?.sku ?? '',
    images: [],
    existingImages,
    optionsMeta,
    variantsMeta,
    categoryId: raw.categoryId || raw.category?.id || '',
    enabled: raw.enabled ?? (raw.isDisabled ? false : (raw.isActive ?? true)),
    quantity,
    categories: [],
    sizes,
    colors,
  };
};

export const mapFormToMultipartFormData = (
  formData: ProductFormData
): FormData => {
  const multipart = new FormData();

  // 1. Required basic fields
  multipart.append('name', formData.nameEn || formData.nameAr || '');
  multipart.append('nameAr', formData.nameAr || formData.nameEn || '');
  multipart.append('categoryId', formData.categoryId || '');

  // 2. Optional description fields
  multipart.append('description', formData.description || '');
  multipart.append('descriptionAr', formData.description || '');

  // Helper: find real option meta by name
  const findOptionMeta = (name: string) =>
    formData.optionsMeta?.find(
      (o) => o.name.toLowerCase() === name.toLowerCase()
    );

  // Helper: find real value ID for a given option meta and value string
  const findValueId = (meta: { values: { id: string; value: string }[] }, val: string) =>
    meta.values.find((v) => v.value === val)?.id || '';

  // Helper: find real variant ID by matching option value IDs
  const findVariantId = (valueIds: string[]): string => {
    if (!formData.variantsMeta || valueIds.length === 0) return '';
    const matched = formData.variantsMeta.find(
      (vm) =>
        vm.optionValueIds.length === valueIds.length &&
        vm.optionValueIds.every((id) => valueIds.includes(id))
    );
    return matched?.id || '';
  };

  // 3. Options structure (JSON-encoded array of options) — preserve real IDs
  const options = [];
  if (formData.sizes && formData.sizes.length > 0) {
    const sizeMeta = findOptionMeta('Size');
    options.push({
      id: sizeMeta?.id || '',
      name: 'Size',
      nameAr: sizeMeta?.nameAr || 'المقاس',
      values: formData.sizes.map((size) => ({
        id: sizeMeta ? findValueId(sizeMeta, size) : '',
        value: size,
        valueAr: size,
      })),
    });
  }
  if (formData.colors && formData.colors.length > 0) {
    const colorMeta = findOptionMeta('Color');
    options.push({
      id: colorMeta?.id || '',
      name: 'Color',
      nameAr: colorMeta?.nameAr || 'اللون',
      values: formData.colors.map((color) => ({
        id: colorMeta ? findValueId(colorMeta, color) : '',
        value: color,
        valueAr: color,
      })),
    });
  }
  multipart.append('options', JSON.stringify(options));

  // 4. Variants structure (JSON-encoded array of variants) — preserve real IDs
  const price = parseFloat(formData.basePrice) || 0;
  const compareAtPrice = formData.comparePrice
    ? parseFloat(formData.comparePrice)
    : 0;
  const stock = formData.quantity || 0;
  const sku = formData.sku || '';

  const variants = [];
  if (options.length === 0) {
    const existingVariantId = formData.variantsMeta?.[0]?.id || '';
    variants.push({
      id: existingVariantId,
      sku,
      price,
      compareAtPrice,
      stock,
      isActive: true,
      optionValues: [],
    });
  } else {
    const sizeOption = options.find((o) => o.name === 'Size');
    const colorOption = options.find((o) => o.name === 'Color');

    const sizeValues = sizeOption?.values || [null];
    const colorValues = colorOption?.values || [null];

    sizeValues.forEach((sizeVal) => {
      colorValues.forEach((colorVal) => {
        const optionValues = [];
        const variantSkuParts = [sku];
        const valueIds: string[] = [];

        if (sizeVal && sizeOption) {
          optionValues.push({
            optionId: sizeOption.id,
            optionName: sizeOption.name,
            optionNameAr: sizeOption.nameAr,
            valueId: sizeVal.id,
            value: sizeVal.value,
            valueAr: sizeVal.valueAr,
          });
          variantSkuParts.push(sizeVal.value);
          if (sizeVal.id) valueIds.push(sizeVal.id);
        }
        if (colorVal && colorOption) {
          optionValues.push({
            optionId: colorOption.id,
            optionName: colorOption.name,
            optionNameAr: colorOption.nameAr,
            valueId: colorVal.id,
            value: colorVal.value,
            valueAr: colorVal.valueAr,
          });
          variantSkuParts.push(colorVal.value);
          if (colorVal.id) valueIds.push(colorVal.id);
        }

        variants.push({
          id: findVariantId(valueIds),
          sku: variantSkuParts.join('-'),
          price,
          compareAtPrice,
          stock:
            Math.round(stock / (sizeValues.length * colorValues.length)) || 1,
          isActive: true,
          optionValues,
        });
      });
    });
  }
  multipart.append('variants', JSON.stringify(variants));

  // 5. Existing images — send their IDs so backend keeps them
  if (formData.existingImages && formData.existingImages.length > 0) {
    multipart.append(
      'existingImageIds',
      JSON.stringify(formData.existingImages.map((img) => img.id))
    );
  }

  // 6. New images to upload
  if (formData.images && formData.images.length > 0) {
    formData.images.forEach((file) => {
      multipart.append('images', file);
    });
  }

  return multipart;
};

export const compressImage = (
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
