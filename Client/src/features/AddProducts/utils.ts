import type {
  ProductFormData,
  RawProductResponse,
  ProductOption,
  ProductOptionValue,
  OptionMeta,
  VariantMeta,
  VarianceCardData,
  ExistingImage,
} from './types';
import {
  addProductOptionValue,
  createProductOption,
} from '../../services/products';

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
        (img) =>
          img &&
          typeof img === 'object' &&
          'isThumbnail' in img &&
          Boolean(img.isThumbnail)
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

  let quantity =
    typeof raw.stock === 'number' && raw.stock > 0
      ? raw.stock
      : typeof raw.stockCount === 'number' && raw.stockCount > 0
        ? raw.stockCount
        : 0;
  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    const sumVariantsStock = raw.variants.reduce(
      (sum: number, v) => sum + (typeof v.stock === 'number' ? v.stock : 0),
      0
    );
    if (sumVariantsStock > 0) {
      quantity = sumVariantsStock;
    }
  }

  // Preserve real variant IDs matched by their option value combination
  const variantsMeta: VariantMeta[] = (raw.variants || []).map((v) => ({
    id: v.id || '',
    optionValueIds: (v.optionValues || []).map((ov: any) => ov.valueId || ''),
  }));

  // Store existing images with their real IDs (don't re-upload them)
  const existingImages: ExistingImage[] = (raw.images || [])
    .filter((img) => img.url)
    .map((img) => ({
      id: img.id || '',
      url: img.url || '',
      isThumbnail: Boolean(img.isThumbnail),
    }));

  const varianceCards: VarianceCardData[] = [];

  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    raw.variants.forEach((variant, index) => {
      let vSize = '';
      let vColor = '';

      if (Array.isArray(variant.optionValues)) {
        variant.optionValues.forEach((ov: any) => {
          const optName = (ov.optionName || ov.name || '').toLowerCase();
          const val = ov.value || ov.valueAr || '';
          if (!val) return;
          if (optName === 'size' || optName === 'المقاس') {
            vSize = val;
            if (!sizes.includes(val)) sizes.push(val);
          } else if (optName === 'color' || optName === 'اللون') {
            vColor = val;
            if (!colors.includes(val)) colors.push(val);
          }
        });
      }

      varianceCards.push({
        id: variant.id || (index + 1).toString(),
        size: vSize,
        color: vColor,
        stock: typeof variant.stock === 'number' ? variant.stock : 0,
        basePrice: variant.price != null ? variant.price.toString() : '',
        comparePrice:
          variant.compareAtPrice != null
            ? variant.compareAtPrice.toString()
            : '',
        sku: variant.sku || '',
      });
    });
  }

  if (varianceCards.length === 0) {
    varianceCards.push({
      id: '1',
      size: sizes[0] || 'XS',
      color: colors[0] || '',
      stock: quantity > 0 ? quantity : 1,
      basePrice: firstVariant?.price?.toString() ?? '',
      comparePrice: firstVariant?.compareAtPrice?.toString() ?? '',
      sku: firstVariant?.sku ?? '',
    });
  }

  return {
    nameAr: raw.nameAr || raw.name || '',
    nameEn: raw.nameEn || raw.name || '',
    description: raw.description || '',
    descriptionAr: raw.descriptionAr || raw.description || '',
    basePrice:
      firstVariant?.price?.toString() ?? (varianceCards[0]?.basePrice || ''),
    comparePrice:
      firstVariant?.compareAtPrice?.toString() ??
      (varianceCards[0]?.comparePrice || ''),
    sku: firstVariant?.sku ?? (varianceCards[0]?.sku || ''),
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
    varianceCards,
  };
};

export interface ProductVariantMutation {
  id?: string;
  optionValueIds: string[];
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
}

const normalizeOptionText = (value?: string) =>
  value?.trim().toLocaleLowerCase() || '';

const unwrapApiData = <T>(response: unknown): T =>
  response &&
  typeof response === 'object' &&
  'data' in response &&
  (response as { data?: T }).data
    ? (response as { data: T }).data
    : (response as T);

export const syncProductOptions = async (
  productId: string,
  formData: ProductFormData,
  product: unknown
): Promise<ProductOption[]> => {
  const raw = unwrapApiData<RawProductResponse>(product) || {};
  const existingOptions = Array.isArray(raw.options) ? raw.options : [];

  const extractedSizes = Array.from(
    new Set(
      formData.varianceCards && formData.varianceCards.length > 0
        ? formData.varianceCards.map((c) => c.size?.trim()).filter(Boolean)
        : formData.sizes || []
    )
  );

  const extractedColors = Array.from(
    new Set(
      formData.varianceCards && formData.varianceCards.length > 0
        ? formData.varianceCards.map((c) => c.color?.trim()).filter(Boolean)
        : formData.colors || []
    )
  );

  const desiredOptions = [
    {
      name: 'Size',
      nameAr: 'المقاس',
      values: extractedSizes,
    },
    {
      name: 'Color',
      nameAr: 'اللون',
      values: extractedColors,
    },
  ].filter((option) => option.values.length > 0);

  return Promise.all(
    desiredOptions.map(async (desiredOption) => {
      const existingOption = existingOptions.find(
        (option) =>
          normalizeOptionText(option.name) ===
            normalizeOptionText(desiredOption.name) ||
          normalizeOptionText(option.nameAr) ===
            normalizeOptionText(desiredOption.nameAr)
      );

      if (!existingOption?.id) {
        const createdOption = unwrapApiData<ProductOption>(
          await createProductOption(productId, {
            name: desiredOption.name,
            nameAr: desiredOption.nameAr,
            values: desiredOption.values.map((value) => ({
              value,
              valueAr: value,
            })),
          })
        );
        return createdOption;
      }

      const existingValues = Array.isArray(existingOption.values)
        ? existingOption.values
        : [];
      const missingValues = desiredOption.values.filter((value) => {
        const normalizedValue = normalizeOptionText(value);
        return !existingValues.some(
          (optionValue) =>
            normalizeOptionText(optionValue.value) === normalizedValue ||
            normalizeOptionText(optionValue.valueAr) === normalizedValue
        );
      });
      const createdValues = await Promise.all(
        missingValues.map(async (value) =>
          unwrapApiData<ProductOptionValue>(
            await addProductOptionValue(productId, existingOption.id!, {
              value,
              valueAr: value,
            })
          )
        )
      );

      return {
        ...existingOption,
        values: [...existingValues, ...createdValues],
      };
    })
  );
};

export const buildProductVariantMutations = (
  formData: ProductFormData,
  productSources: unknown | unknown[]
): ProductVariantMutation[] => {
  const sources = Array.isArray(productSources)
    ? productSources
    : [productSources];
  const products = sources.map((product) =>
    product &&
    typeof product === 'object' &&
    'data' in product &&
    (product as { data?: RawProductResponse }).data
      ? (product as { data: RawProductResponse }).data
      : (product as RawProductResponse) || {}
  );

  const productOptions = products.flatMap((product) =>
    Array.isArray(product.options) ? product.options : []
  );
  const productVariants = products.flatMap((product) =>
    Array.isArray(product.variants) ? product.variants : []
  );

  const findOption = (name: string, nameAr: string) =>
    productOptions.find(
      (option) =>
        normalizeOptionText(option.name) === normalizeOptionText(name) ||
        normalizeOptionText(option.nameAr) === normalizeOptionText(nameAr)
    );

  const findValueId = (
    option: (typeof productOptions)[number] | undefined,
    val: string
  ) => {
    if (!option || !val) return undefined;
    const normalized = normalizeOptionText(val);
    return option.values?.find(
      (v) =>
        normalizeOptionText(v.value) === normalized ||
        normalizeOptionText(v.valueAr) === normalized
    )?.id;
  };

  const cards =
    formData.varianceCards && formData.varianceCards.length > 0
      ? formData.varianceCards
      : [
          {
            id: '1',
            size: formData.sizes?.[0] || '',
            color: formData.colors?.[0] || '',
            stock: formData.quantity || 100,
            basePrice: formData.basePrice || '0',
            comparePrice: formData.comparePrice || '',
            sku: formData.sku || '',
          },
        ];

  const sizeOption = findOption('Size', 'المقاس');
  const colorOption = findOption('Color', 'اللون');

  return cards.map((card) => {
    const sizeValId = card.size ? findValueId(sizeOption, card.size) : undefined;
    const colorValId = card.color
      ? findValueId(colorOption, card.color)
      : undefined;
    const optionValueIds = [sizeValId, colorValId].filter(
      (id): id is string => Boolean(id)
    );

    const price =
      parseFloat(card.basePrice) || parseFloat(formData.basePrice) || 0;
    const compareAtPrice = card.comparePrice
      ? parseFloat(card.comparePrice)
      : formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : undefined;

    const existingVariant =
      (card.id && !card.id.match(/^\d{13}$/)
        ? productVariants.find((v) => v.id === card.id)
        : undefined) ||
      productVariants.find((variant) => {
        const existingValueIds = Array.isArray(variant.optionValues)
          ? variant.optionValues
              .map(
                (optionValue: any) =>
                  optionValue?.valueId ||
                  optionValue?.id ||
                  optionValue?.optionValueId
              )
              .filter((id): id is string => Boolean(id))
          : [];

        if (optionValueIds.length === 0 && existingValueIds.length === 0) {
          return true;
        }

        return (
          optionValueIds.length > 0 &&
          existingValueIds.length === optionValueIds.length &&
          existingValueIds.every((id) => optionValueIds.includes(id))
        );
      });

    const skuParts = [formData.sku, card.size, card.color].filter(Boolean);
    const sku =
      card.sku ||
      existingVariant?.sku ||
      skuParts.join('-') ||
      `SKU-${Date.now()}`;

    return {
      id: existingVariant?.id,
      optionValueIds,
      sku,
      price,
      compareAtPrice:
        compareAtPrice && compareAtPrice > 0 ? compareAtPrice : undefined,
      stock: Number(card.stock) || 0,
      isActive: true,
    };
  });
};

export const mapFormToMultipartFormData = (
  formData: ProductFormData
): FormData => {
  const multipart = new FormData();

  // 1. Required basic fields
  multipart.append('name', formData.nameEn || formData.nameAr || '');
  multipart.append('nameAr', formData.nameAr || formData.nameEn || '');
  multipart.append('categoryId', formData.categoryId || '');

  // Calculate total stock from cards
  const cards =
    formData.varianceCards && formData.varianceCards.length > 0
      ? formData.varianceCards
      : [
          {
            id: '1',
            size: formData.sizes?.[0] || '',
            color: formData.colors?.[0] || '',
            stock: formData.quantity || 100,
            basePrice: formData.basePrice || '0',
            comparePrice: formData.comparePrice || '',
            sku: formData.sku || '',
          },
        ];

  const totalStock = cards.reduce(
    (sum, c) => sum + (Number(c.stock) || 0),
    0
  );
  multipart.append('stock', totalStock.toString());

  const firstBasePrice =
    cards.find((c) => c.basePrice)?.basePrice || formData.basePrice || '0';
  const firstComparePrice =
    cards.find((c) => c.comparePrice)?.comparePrice ||
    formData.comparePrice ||
    '';

  if (firstBasePrice) {
    multipart.append('price', firstBasePrice);
  }
  if (firstComparePrice) {
    multipart.append('compareAtPrice', firstComparePrice);
  }

  // 2. Optional description fields
  multipart.append('description', formData.description || '');
  multipart.append(
    'descriptionAr',
    formData.descriptionAr || formData.description || ''
  );

  // Helper: find real option meta by name
  const findOptionMeta = (name: string) =>
    formData.optionsMeta?.find(
      (o) => o.name.toLowerCase() === name.toLowerCase()
    );

  // Helper: find real value ID for a given option meta and value string
  const findValueId = (
    meta: { values: { id: string; value: string; valueAr?: string }[] },
    val: string
  ) => {
    const normalizedValue = normalizeOptionText(val);
    return (
      meta.values.find(
        (value) =>
          normalizeOptionText(value.value) === normalizedValue ||
          normalizeOptionText(value.valueAr) === normalizedValue
      )?.id || ''
    );
  };

  // Helper: find real variant ID by matching option value IDs
  const findVariantId = (valueIds: string[]): string => {
    if (!formData.variantsMeta || valueIds.length === 0) return '';
    const matched = formData.variantsMeta.find(
      (vm) =>
        vm.optionValueIds.length === valueIds.length &&
        vm.optionValueIds.every((id: string) => valueIds.includes(id))
    );
    return matched?.id || '';
  };

  // 3. Options structure (JSON-encoded array of options) — preserve real IDs
  const uniqueSizes = Array.from(
    new Set(
      cards
        .map((c) => c.size?.trim())
        .filter((s): s is string => Boolean(s))
    )
  );
  const uniqueColors = Array.from(
    new Set(
      cards
        .map((c) => c.color?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  const options = [];
  if (uniqueSizes.length > 0) {
    const sizeMeta = findOptionMeta('Size');
    options.push({
      ...(sizeMeta?.id ? { id: sizeMeta.id } : {}),
      name: 'Size',
      nameAr: sizeMeta?.nameAr || 'المقاس',
      values: uniqueSizes.map((size) => {
        const valueId = sizeMeta ? findValueId(sizeMeta, size) : '';
        return {
          ...(valueId ? { id: valueId } : {}),
          value: size,
          valueAr: size,
        };
      }),
    });
  }
  if (uniqueColors.length > 0) {
    const colorMeta = findOptionMeta('Color');
    options.push({
      ...(colorMeta?.id ? { id: colorMeta.id } : {}),
      name: 'Color',
      nameAr: colorMeta?.nameAr || 'اللون',
      values: uniqueColors.map((color) => {
        const valueId = colorMeta ? findValueId(colorMeta, color) : '';
        return {
          ...(valueId ? { id: valueId } : {}),
          value: color,
          valueAr: color,
        };
      }),
    });
  }
  multipart.append('options', JSON.stringify(options));

  // 4. Variants structure (JSON-encoded array of variants) — preserve real IDs
  const variants = cards.map((card) => {
    const optionValues = [];
    const valueIds: string[] = [];

    const sizeOption = options.find((o) => o.name === 'Size');
    const colorOption = options.find((o) => o.name === 'Color');

    if (card.size && card.size.trim()) {
      const sizeVal = sizeOption?.values.find(
        (v) => normalizeOptionText(v.value) === normalizeOptionText(card.size)
      );
      if (sizeOption) {
        optionValues.push({
          ...(sizeOption.id ? { optionId: sizeOption.id } : {}),
          optionName: sizeOption.name,
          optionNameAr: sizeOption.nameAr,
          ...(sizeVal?.id ? { valueId: sizeVal.id } : {}),
          value: card.size.trim(),
          valueAr: card.size.trim(),
        });
      }
      if (sizeVal?.id) valueIds.push(sizeVal.id);
    }

    if (card.color && card.color.trim()) {
      const colorVal = colorOption?.values.find(
        (v) => normalizeOptionText(v.value) === normalizeOptionText(card.color)
      );
      if (colorOption) {
        optionValues.push({
          ...(colorOption.id ? { optionId: colorOption.id } : {}),
          optionName: colorOption.name,
          optionNameAr: colorOption.nameAr,
          ...(colorVal?.id ? { valueId: colorVal.id } : {}),
          value: card.color.trim(),
          valueAr: card.color.trim(),
        });
      }
      if (colorVal?.id) valueIds.push(colorVal.id);
    }

    const cardPrice =
      parseFloat(card.basePrice) || parseFloat(formData.basePrice) || 0;
    const cardComparePrice = card.comparePrice
      ? parseFloat(card.comparePrice)
      : formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : undefined;

    const existingVariantId =
      card.id && !card.id.match(/^\d{13}$/)
        ? card.id
        : findVariantId(valueIds);

    const skuParts = [formData.sku, card.size, card.color].filter(Boolean);
    const sku =
      card.sku || skuParts.join('-') || `SKU-${Date.now()}`;

    return {
      ...(existingVariantId ? { id: existingVariantId } : {}),
      sku,
      price: cardPrice,
      compareAtPrice:
        cardComparePrice && cardComparePrice > 0 ? cardComparePrice : undefined,
      stock: Number(card.stock) || 0,
      isActive: true,
      optionValues,
    };
  });

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
