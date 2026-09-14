export interface StandardAttributeValue {
  id: string;
  value: string;
  valueAr: string;
  sortOrder: number;
  hexColor?: string;
}

export interface StandardAttribute {
  id: string;
  name: string;
  nameAr: string;
  sortOrder: number;
  values: StandardAttributeValue[];
}

export interface CreateStandardAttributeValueDto {
  value: string;
  valueAr: string;
  sortOrder?: number;
}

export interface CreateStandardAttributeDto {
  name: string;
  nameAr: string;
  sortOrder?: number;
  values?: CreateStandardAttributeValueDto[];
}

export interface UpdateStandardAttributeDto {
  name?: string;
  nameAr?: string;
  sortOrder?: number;
}

export interface UpdateStandardAttributeValueDto {
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
