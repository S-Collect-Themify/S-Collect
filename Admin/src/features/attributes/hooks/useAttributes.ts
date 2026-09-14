import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  getStandardAttributes,
  createStandardAttribute,
  updateStandardAttribute,
  deleteStandardAttribute,
  addStandardAttributeValue,
  updateStandardAttributeValue,
  deleteStandardAttributeValue,
} from '../../../services/standardAttributes';
import { attributeKeys } from '../attributeKeys';
import type {
  CreateStandardAttributeDto,
  UpdateStandardAttributeDto,
  CreateStandardAttributeValueDto,
  UpdateStandardAttributeValueDto,
  StandardAttribute,
} from '../types';

/**
 * Fetch all standard attributes with values
 */
export const useStandardAttributes = () => {
  return useQuery<StandardAttribute[]>({
    queryKey: attributeKeys.all,
    queryFn: getStandardAttributes,
    staleTime: 30000,
  });
};

/**
 * Create a new attribute
 */
export const useCreateAttribute = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (dto: CreateStandardAttributeDto) => createStandardAttribute(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.createSuccess', 'Attribute created successfully'));
    },
    onError: (err: any) => {
      const message = err?.message || t('attributes.toasts.createError', 'Failed to create attribute');
      toast.error(message);
    },
  });
};

/**
 * Update an existing attribute
 */
export const useUpdateAttribute = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStandardAttributeDto }) =>
      updateStandardAttribute(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.updateSuccess', 'Attribute updated successfully'));
    },
    onError: (err: any) => {
      const message = err?.message || t('attributes.toasts.updateError', 'Failed to update attribute');
      toast.error(message);
    },
  });
};

/**
 * Delete an attribute
 */
export const useDeleteAttribute = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => deleteStandardAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.deleteSuccess', 'Attribute deleted successfully'));
    },
    onError: (err: any) => {
      const message = err?.message || t('attributes.toasts.deleteError', 'Failed to delete attribute. It may be in use by products.');
      toast.error(message);
    },
  });
};

/**
 * Add a value to an existing attribute
 */
export const useAddAttributeValue = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      attributeId,
      dto,
    }: {
      attributeId: string;
      dto: CreateStandardAttributeValueDto;
    }) => addStandardAttributeValue(attributeId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.addValueSuccess', 'Value added successfully'));
    },
    onError: (err: any) => {
      const message = err?.message || t('attributes.toasts.addValueError', 'Failed to add value');
      toast.error(message);
    },
  });
};

/**
 * Update a value of an existing attribute
 */
export const useUpdateAttributeValue = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      attributeId,
      valueId,
      dto,
    }: {
      attributeId: string;
      valueId: string;
      dto: UpdateStandardAttributeValueDto;
    }) => updateStandardAttributeValue(attributeId, valueId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.updateValueSuccess', 'Value updated successfully'));
    },
    onError: (err: any) => {
      const message = err?.message || t('attributes.toasts.updateValueError', 'Failed to update value');
      toast.error(message);
    },
  });
};

/**
 * Delete a value from an attribute
 */
export const useDeleteAttributeValue = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({
      attributeId,
      valueId,
    }: {
      attributeId: string;
      valueId: string;
    }) => deleteStandardAttributeValue(attributeId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attributeKeys.all });
      toast.success(t('attributes.toasts.deleteValueSuccess', 'Value removed successfully'));
    },
    onError: (err: any) => {
      const message =
        err?.message ||
        t(
          'attributes.toasts.deleteValueError',
          'Failed to remove value. It may be in use by product variants.'
        );
      toast.error(message);
    },
  });
};
