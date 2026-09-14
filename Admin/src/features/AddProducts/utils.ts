import type { ProductFormData } from './types';

export const mapFormToMultipartFormData = (formData: ProductFormData): FormData => {
  const multipart = new FormData();
  
  // 1. Required basic fields
  multipart.append('name', formData.nameEn || formData.nameAr || '');
  multipart.append('nameAr', formData.nameAr || formData.nameEn || '');
  multipart.append('categoryId', formData.categoryId || '');
  multipart.append('season', formData.season || 'all');

  // 2. Optional description fields
  multipart.append('description', formData.description || '');
  multipart.append('descriptionAr', formData.description || '');

  // 3. Options structure (JSON-encoded array of options)
  const options = [];
  if (formData.sizes && formData.sizes.length > 0) {
    options.push({
      id: "option-size-id",
      name: "Size",
      nameAr: "المقاس",
      values: formData.sizes.map((size, index) => ({
        id: `size-value-${index}`,
        value: size,
        valueAr: size,
      })),
    });
  }
  if (formData.colors && formData.colors.length > 0) {
    options.push({
      id: "option-color-id",
      name: "Color",
      nameAr: "اللون",
      values: formData.colors.map((color, index) => ({
        id: `color-value-${index}`,
        value: color,
        valueAr: color,
      })),
    });
  }
  multipart.append('options', JSON.stringify(options));

  // 4. Variants structure (JSON-encoded array of variants)
  const price = parseFloat(formData.basePrice) || 0;
  const compareAtPrice = formData.comparePrice ? parseFloat(formData.comparePrice) : 0;
  const stock = formData.quantity || 0;
  const sku = formData.sku || '';

  const variants = [];
  if (options.length === 0) {
    variants.push({
      id: "default-variant-id",
      sku,
      price,
      compareAtPrice,
      stock,
      isActive: true,
      optionValues: [],
    });
  } else {
    const sizeOption = options.find((o) => o.name === "Size");
    const colorOption = options.find((o) => o.name === "Color");

    const sizeValues = sizeOption?.values || [null];
    const colorValues = colorOption?.values || [null];

    let variantIndex = 1;
    sizeValues.forEach((sizeVal) => {
      colorValues.forEach((colorVal) => {
        const optionValues = [];
        const variantSkuParts = [sku];

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
        }

        variants.push({
          id: `variant-id-${variantIndex++}`,
          sku: variantSkuParts.join('-'),
          price,
          compareAtPrice,
          stock: Math.round(stock / (sizeValues.length * colorValues.length)) || 1,
          isActive: true,
          optionValues,
        });
      });
    });
  }
  multipart.append('variants', JSON.stringify(variants));

  // 5. Images array of Files
  if (formData.images && formData.images.length > 0) {
    formData.images.forEach((file) => {
      multipart.append('images', file);
    });
  }

  return multipart;
};

export const compressImage = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.7): Promise<File> => {
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
