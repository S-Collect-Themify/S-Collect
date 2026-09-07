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
      const attributes: Record<string, string> = {};

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
          const key = ov.optionId || ov.optionName || ov.name || '';
          if (key) {
            attributes[key] = val;
          }
        });
      }

      varianceCards.push({
        id: variant.id || (index + 1).toString(),
        size: vSize,
        color: vColor,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
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

  const cards =
    formData.varianceCards && formData.varianceCards.length > 0
      ? formData.varianceCards
      : [];

  const activeMetaList =
    formData.optionsMeta && formData.optionsMeta.length > 0
      ? formData.optionsMeta
      : [
          {
            id: '',
            name: 'Size',
            nameAr: 'المقاس',
            values: [],
          },
        ];

  const desiredOptions = activeMetaList
    .map((meta, metaIdx) => {
      const extractedValues = Array.from(
        new Set(
          cards
            .map((c) => {
              if (metaIdx === 0) {
                return (
                  c.size?.trim() ||
                  c.attributes?.[meta.id]?.trim() ||
                  c.attributes?.[meta.name]?.trim() ||
                  ''
                );
              }
              if (metaIdx === 1) {
                return (
                  c.color?.trim() ||
                  c.attributes?.[meta.id]?.trim() ||
                  c.attributes?.[meta.name]?.trim() ||
                  ''
                );
              }
              return (
                c.attributes?.[meta.id]?.trim() ||
                c.attributes?.[meta.name]?.trim() ||
                ''
              );
            })
            .filter((val): val is string => Boolean(val))
        )
      );

      const optionName =
        meta.name ||
        (metaIdx === 0 ? 'Size' : metaIdx === 1 ? 'Color' : `Option ${metaIdx + 1}`);
      const optionNameAr = meta.nameAr || optionName;

      return {
        name: optionName,
        nameAr: optionNameAr,
        values: extractedValues.map((val) => {
          const matched = meta.values?.find(
            (v) => normalizeOptionText(v.value) === normalizeOptionText(val)
          );
          return { value: val, valueAr: matched?.valueAr || val };
        }),
      };
    })
    .filter((option) => option.values.length > 0);

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
            values: desiredOption.values.map((v) => ({
              value: typeof v === 'string' ? v : v.value,
              valueAr: typeof v === 'string' ? v : v.valueAr,
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

  const activeMetaList = formData.optionsMeta || [];

  return cards.map((card) => {
    const optionValueIds: string[] = [];

    activeMetaList.forEach((meta, metaIdx) => {
      const option = findOption(meta.name, meta.nameAr);
      let cardVal = '';
      if (metaIdx === 0) {
        cardVal =
          card.size?.trim() ||
          card.attributes?.[meta.id]?.trim() ||
          card.attributes?.[meta.name]?.trim() ||
          '';
      } else if (metaIdx === 1) {
        cardVal =
          card.color?.trim() ||
          card.attributes?.[meta.id]?.trim() ||
          card.attributes?.[meta.name]?.trim() ||
          '';
      } else {
        cardVal =
          card.attributes?.[meta.id]?.trim() ||
          card.attributes?.[meta.name]?.trim() ||
          '';
      }

      if (cardVal) {
        const valId = findValueId(option, cardVal);
        if (valId) optionValueIds.push(valId);
      }
    });

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

    const extraAttrVals = card.attributes
      ? Object.values(card.attributes).filter(Boolean)
      : [];
    const skuParts = [
      formData.sku,
      card.size,
      card.color,
      ...extraAttrVals,
    ].filter(Boolean);
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

  const totalStock = cards.reduce((sum, c) => sum + (Number(c.stock) || 0), 0);
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
  const options: any[] = [];
  const activeMetaList =
    formData.optionsMeta && formData.optionsMeta.length > 0
      ? formData.optionsMeta
      : [
          {
            id: '',
            name: 'Size',
            nameAr: 'المقاس',
            values: [],
          },
        ];

  activeMetaList.forEach((meta, metaIdx) => {
    const uniqueValues = Array.from(
      new Set(
        cards
          .map((c) => {
            if (metaIdx === 0) {
              return (
                c.size?.trim() ||
                c.attributes?.[meta.id]?.trim() ||
                c.attributes?.[meta.name]?.trim() ||
                ''
              );
            }
            if (metaIdx === 1) {
              return (
                c.color?.trim() ||
                c.attributes?.[meta.id]?.trim() ||
                c.attributes?.[meta.name]?.trim() ||
                ''
              );
            }
            return (
              c.attributes?.[meta.id]?.trim() ||
              c.attributes?.[meta.name]?.trim() ||
              ''
            );
          })
          .filter((val): val is string => Boolean(val))
      )
    );

    if (uniqueValues.length > 0) {
      const optionName =
        meta.name ||
        (metaIdx === 0 ? 'Size' : metaIdx === 1 ? 'Color' : `Option ${metaIdx + 1}`);
      const optionNameAr = meta.nameAr || optionName;

      options.push({
        ...(meta.id ? { id: meta.id } : {}),
        name: optionName,
        nameAr: optionNameAr,
        values: uniqueValues.map((val) => {
          const valueId = findValueId(meta, val);
          const matchedVal = meta.values?.find(
            (v) => normalizeOptionText(v.value) === normalizeOptionText(val)
          );
          return {
            ...(valueId ? { id: valueId } : {}),
            value: val,
            valueAr: matchedVal?.valueAr || val,
          };
        }),
      });
    }
  });

  multipart.append('options', JSON.stringify(options));

  // 4. Variants structure (JSON-encoded array of variants) — preserve real IDs
  const variants = cards.map((card) => {
    const optionValues: any[] = [];
    const valueIds: string[] = [];

    options.forEach((opt, optIdx) => {
      let cardVal = '';
      if (optIdx === 0) {
        cardVal =
          card.size?.trim() ||
          card.attributes?.[opt.id]?.trim() ||
          card.attributes?.[opt.name]?.trim() ||
          '';
      } else if (optIdx === 1) {
        cardVal =
          card.color?.trim() ||
          card.attributes?.[opt.id]?.trim() ||
          card.attributes?.[opt.name]?.trim() ||
          '';
      } else {
        cardVal =
          card.attributes?.[opt.id]?.trim() ||
          card.attributes?.[opt.name]?.trim() ||
          '';
      }

      if (cardVal) {
        const matchedVal = opt.values?.find(
          (v: any) => normalizeOptionText(v.value) === normalizeOptionText(cardVal)
        );
        optionValues.push({
          ...(opt.id ? { optionId: opt.id } : {}),
          optionName: opt.name,
          optionNameAr: opt.nameAr,
          ...(matchedVal?.id ? { valueId: matchedVal.id } : {}),
          value: cardVal,
          valueAr: matchedVal?.valueAr || cardVal,
        });
        if (matchedVal?.id) {
          valueIds.push(matchedVal.id);
        }
      }
    });

    const cardPrice =
      parseFloat(card.basePrice) || parseFloat(formData.basePrice) || 0;
    const cardComparePrice = card.comparePrice
      ? parseFloat(card.comparePrice)
      : formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : undefined;

    const existingVariantId =
      card.id && !card.id.match(/^\d{13}$/) ? card.id : findVariantId(valueIds);

    const extraAttrVals = card.attributes
      ? Object.values(card.attributes).filter(Boolean)
      : [];
    const skuParts = [
      formData.sku,
      card.size,
      card.color,
      ...extraAttrVals,
    ].filter(Boolean);
    const sku = card.sku || skuParts.join('-') || `SKU-${Date.now()}`;

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

/**
 * Generates a clean, unique random SKU for product variants.
 * Format: SKU-[COLOR-][SIZE-]XXXX
 */
export const generateRandomSku = (color?: string, size?: string): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const colorCode = color
    ? color.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
    : '';
  const sizeCode = size
    ? size.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase()
    : '';

  const parts = ['SKU'];
  if (colorCode) parts.push(colorCode);
  if (sizeCode) parts.push(sizeCode);
  parts.push(rand);
  return parts.join('-');
};

