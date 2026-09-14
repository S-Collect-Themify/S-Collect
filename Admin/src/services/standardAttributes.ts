import { api, handleServiceError } from './api';
import type {
  StandardAttribute,
  StandardAttributeValue,
  CreateStandardAttributeDto,
  UpdateStandardAttributeDto,
  CreateStandardAttributeValueDto,
  UpdateStandardAttributeValueDto,
} from '../features/attributes/types';

// Helper: safe unwrap for standard API envelope { success: true, data: ... } or raw payload
const unwrap = <T>(res: unknown): T => {
  if (res && typeof res === 'object' && 'data' in res && 'success' in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

/**
 * List all standard pre-configured attributes and their values
 * GET /api/v1/admin/standard-attributes
 */
export const getStandardAttributes = async (): Promise<StandardAttribute[]> => {
  try {
    const { data } = await api.get('/admin/standard-attributes');
    const result = unwrap<StandardAttribute[]>(data);
    return Array.isArray(result) ? result : [];
  } catch (err) {
    throw handleServiceError(err, 'Failed to fetch standard attributes');
  }
};

/**
 * Create a new standard attribute (optionally with initial values)
 * POST /api/v1/admin/standard-attributes
 */
export const createStandardAttribute = async (
  dto: CreateStandardAttributeDto
): Promise<StandardAttribute> => {
  try {
    const { data } = await api.post('/admin/standard-attributes', dto);
    return unwrap<StandardAttribute>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to create standard attribute');
  }
};

/**
 * Update a standard attribute name or sort order
 * PUT /api/v1/admin/standard-attributes/{id}
 */
export const updateStandardAttribute = async (
  id: string,
  dto: UpdateStandardAttributeDto
): Promise<StandardAttribute> => {
  try {
    const { data } = await api.put(`/admin/standard-attributes/${id}`, dto);
    return unwrap<StandardAttribute>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to update standard attribute');
  }
};

/**
 * Delete a standard attribute (only if not used by any product)
 * DELETE /api/v1/admin/standard-attributes/{id}
 */
export const deleteStandardAttribute = async (id: string): Promise<void> => {
  try {
    await api.delete(`/admin/standard-attributes/${id}`);
  } catch (err) {
    throw handleServiceError(
      err,
      'Failed to delete attribute. It may be in use by one or more products.'
    );
  }
};

/**
 * Add a value to a standard attribute
 * POST /api/v1/admin/standard-attributes/{id}/values
 */
export const addStandardAttributeValue = async (
  attributeId: string,
  dto: CreateStandardAttributeValueDto
): Promise<StandardAttributeValue> => {
  try {
    const { data } = await api.post(
      `/admin/standard-attributes/${attributeId}/values`,
      dto
    );
    return unwrap<StandardAttributeValue>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to add attribute value');
  }
};

/**
 * Update a value of a standard attribute
 * PUT /api/v1/admin/standard-attributes/{id}/values/{valueId}
 */
export const updateStandardAttributeValue = async (
  attributeId: string,
  valueId: string,
  dto: UpdateStandardAttributeValueDto
): Promise<StandardAttributeValue> => {
  try {
    const { data } = await api.put(
      `/admin/standard-attributes/${attributeId}/values/${valueId}`,
      dto
    );
    return unwrap<StandardAttributeValue>(data);
  } catch (err) {
    throw handleServiceError(err, 'Failed to update attribute value');
  }
};

/**
 * Remove a value (only if not used by any product variant)
 * DELETE /api/v1/admin/standard-attributes/{id}/values/{valueId}
 */
export const deleteStandardAttributeValue = async (
  attributeId: string,
  valueId: string
): Promise<void> => {
  try {
    await api.delete(`/admin/standard-attributes/${attributeId}/values/${valueId}`);
  } catch (err) {
    throw handleServiceError(
      err,
      'Failed to delete value. It may be in use by active product variants.'
    );
  }
};
