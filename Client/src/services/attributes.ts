import { api, handleServiceError } from './api';
import type {
  VendorAttribute,
  VendorAttributeValue,
  CreateVendorAttributeDto,
  UpdateVendorAttributeDto,
  CreateVendorAttributeValueDto,
  UpdateVendorAttributeValueDto,
} from '../features/attributes/types';

// Helper: safe unwrap for standard API envelope { success: true, data: ... } or raw payload
const unwrap = <T>(res: unknown): T => {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * List all vendor pre-configured attributes and their values
 * GET /api/v1/vendor/attributes
 */
export const getVendorAttributes = async (): Promise<VendorAttribute[]> => {
  try {
    const { data } = await api.get('/vendor/attributes');
    const result = unwrap<VendorAttribute[]>(data);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch vendor attributes');
  }
};

/**
 * Create a new attribute (optionally with initial values)
 * POST /api/v1/vendor/attributes
 */
export const createVendorAttribute = async (
  dto: CreateVendorAttributeDto
): Promise<VendorAttribute> => {
  try {
    const { data } = await api.post('/vendor/attributes', dto);
    return unwrap<VendorAttribute>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to create attribute');
  }
};

/**
 * Update an attribute name or sort order
 * PUT /api/v1/vendor/attributes/{id}
 */
export const updateVendorAttribute = async (
  id: string,
  dto: UpdateVendorAttributeDto
): Promise<VendorAttribute> => {
  try {
    const { data } = await api.put(`/vendor/attributes/${id}`, dto);
    return unwrap<VendorAttribute>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to update attribute');
  }
};

/**
 * Delete an attribute (only if not used by any product)
 * DELETE /api/v1/vendor/attributes/{id}
 */
export const deleteVendorAttribute = async (id: string): Promise<void> => {
  try {
    await api.delete(`/vendor/attributes/${id}`);
  } catch (err) {
    throw handleServiceError(
      err,
      'Failed to delete attribute. It may be in use by one or more products.'
    );
  }
};

/**
 * Add a value to an attribute
 * POST /api/v1/vendor/attributes/{id}/values
 */
export const addVendorAttributeValue = async (
  attributeId: string,
  dto: CreateVendorAttributeValueDto
): Promise<VendorAttributeValue> => {
  try {
    const { data } = await api.post(
      `/vendor/attributes/${attributeId}/values`,
      dto
    );
    return unwrap<VendorAttributeValue>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to add attribute value');
  }
};

/**
 * Update a value of an attribute
 * PUT /api/v1/vendor/attributes/{id}/values/{valueId}
 */
export const updateVendorAttributeValue = async (
  attributeId: string,
  valueId: string,
  dto: UpdateVendorAttributeValueDto
): Promise<VendorAttributeValue> => {
  try {
    const { data } = await api.put(
      `/vendor/attributes/${attributeId}/values/${valueId}`,
      dto
    );
    return unwrap<VendorAttributeValue>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to update attribute value');
  }
};

/**
 * Remove a value (only if not used by any product variant)
 * DELETE /api/v1/vendor/attributes/{id}/values/{valueId}
 */
export const deleteVendorAttributeValue = async (
  attributeId: string,
  valueId: string
): Promise<void> => {
  try {
    await api.delete(`/vendor/attributes/${attributeId}/values/${valueId}`);
  } catch (err) {
    throw handleServiceError(
      err,
      'Failed to delete value. It may be in use by active product variants.'
    );
  }
};
