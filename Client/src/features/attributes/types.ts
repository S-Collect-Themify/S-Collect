export interface VendorAttributeValue {
  id: string;
  value: string;
  valueAr: string;
  sortOrder: number;
  hexColor?: string;
}

export interface VendorAttribute {
  id: string;
  name: string;
  nameAr: string;
  sortOrder: number;
  values: VendorAttributeValue[];
}

export interface CreateVendorAttributeValueDto {
  value: string;
  valueAr: string;
  sortOrder?: number;
}

export interface CreateVendorAttributeDto {
  name: string;
  nameAr: string;
  sortOrder?: number;
  values?: CreateVendorAttributeValueDto[];
}

export interface UpdateVendorAttributeDto {
  name?: string;
  nameAr?: string;
  sortOrder?: number;
}

export interface UpdateVendorAttributeValueDto {
  value?: string;
  valueAr?: string;
  sortOrder?: number;
}

// Form state interfaces for modals
export interface AttributeFormData {
  name: string;
  nameAr: string;
  sortOrder: number;
  initialValues?: Array<{
    value: string;
    valueAr: string;
    sortOrder: number;
  }>;
}

export interface AttributeValueFormData {
  value: string;
  valueAr: string;
  sortOrder: number;
}

// Modal control state
export type AttributeModalMode = 'create' | 'edit' | null;

export interface AttributeDeleteTarget {
  type: 'attribute' | 'value';
  attributeId: string;
  attributeName: string;
  valueId?: string;
  valueName?: string;
}
