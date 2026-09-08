import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  useVendorAttributes,
  useCreateAttribute,
  useUpdateAttribute,
  useDeleteAttribute,
  useAddAttributeValue,
  useUpdateAttributeValue,
  useDeleteAttributeValue,
} from '../features/attributes/hooks/useAttributes';
import type {
  VendorAttribute,
  VendorAttributeValue,
  AttributeDeleteTarget,
  CreateVendorAttributeDto,
  UpdateVendorAttributeDto,
  CreateVendorAttributeValueDto,
  UpdateVendorAttributeValueDto,
} from '../features/attributes/types';
import { AttributeCard } from '../features/attributes/components/AttributeCard';
import { AttributeFormModal } from '../features/attributes/components/AttributeFormModal';
import { AttributeValueModal } from '../features/attributes/components/AttributeValueModal';
import { AttributeDeleteModal } from '../features/attributes/components/AttributeDeleteModal';
import { AttributeSkeleton } from '../features/attributes/components/AttributeSkeleton';
import { AttributeEmptyState } from '../features/attributes/components/AttributeEmptyState';
import { containerVariants, itemVariants } from '../utils/animations';

const Attributes = () => {
  const { t } = useTranslation();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [selectedAttributeForEdit, setSelectedAttributeForEdit] =
    useState<VendorAttribute | null>(null);

  const [isValueModalOpen, setIsValueModalOpen] = useState(false);
  const [activeParentAttribute, setActiveParentAttribute] =
    useState<VendorAttribute | null>(null);
  const [selectedValueForEdit, setSelectedValueForEdit] =
    useState<VendorAttributeValue | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AttributeDeleteTarget | null>(
    null
  );

  // Queries & Mutations
  const {
    data: attributes = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useVendorAttributes();

  const createAttributeMutation = useCreateAttribute();
  const updateAttributeMutation = useUpdateAttribute();
  const deleteAttributeMutation = useDeleteAttribute();
  const addValueMutation = useAddAttributeValue();
  const updateValueMutation = useUpdateAttributeValue();
  const deleteValueMutation = useDeleteAttributeValue();

  // Filtered attributes based on search query
  const filteredAttributes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return attributes;

    return attributes.filter((attr) => {
      const matchNameEn = attr.name?.toLowerCase().includes(q);
      const matchNameAr = attr.nameAr?.toLowerCase().includes(q);
      const matchValues = attr.values?.some(
        (v) =>
          v.value?.toLowerCase().includes(q) ||
          v.valueAr?.toLowerCase().includes(q)
      );
      return matchNameEn || matchNameAr || matchValues;
    });
  }, [attributes, searchQuery]);

  // Attribute Modal Handlers
  const handleOpenCreateAttribute = () => {
    setSelectedAttributeForEdit(null);
    setIsAttributeModalOpen(true);
  };

  const handleOpenEditAttribute = (attr: VendorAttribute) => {
    setSelectedAttributeForEdit(attr);
    setIsAttributeModalOpen(true);
  };

  const handleCloseAttributeModal = () => {
    setIsAttributeModalOpen(false);
    setSelectedAttributeForEdit(null);
  };

  const handleSubmitAttributeForm = async (
    data: CreateVendorAttributeDto | UpdateVendorAttributeDto
  ) => {
    if (selectedAttributeForEdit) {
      await updateAttributeMutation.mutateAsync({
        id: selectedAttributeForEdit.id,
        dto: data as UpdateVendorAttributeDto,
      });
    } else {
      await createAttributeMutation.mutateAsync(
        data as CreateVendorAttributeDto
      );
    }
    handleCloseAttributeModal();
  };

  // Value Modal Handlers
  const handleOpenAddValue = (attr: VendorAttribute) => {
    setActiveParentAttribute(attr);
    setSelectedValueForEdit(null);
    setIsValueModalOpen(true);
  };

  const handleOpenEditValue = (
    attr: VendorAttribute,
    val: VendorAttributeValue
  ) => {
    setActiveParentAttribute(attr);
    setSelectedValueForEdit(val);
    setIsValueModalOpen(true);
  };

  const handleCloseValueModal = () => {
    setIsValueModalOpen(false);
    setActiveParentAttribute(null);
    setSelectedValueForEdit(null);
  };

  const handleSubmitValueForm = async (
    data: CreateVendorAttributeValueDto | UpdateVendorAttributeValueDto
  ) => {
    if (!activeParentAttribute) return;

    if (selectedValueForEdit) {
      await updateValueMutation.mutateAsync({
        attributeId: activeParentAttribute.id,
        valueId: selectedValueForEdit.id,
        dto: data as UpdateVendorAttributeValueDto,
      });
    } else {
      await addValueMutation.mutateAsync({
        attributeId: activeParentAttribute.id,
        dto: data as CreateVendorAttributeValueDto,
      });
    }
    handleCloseValueModal();
  };

  // Delete Modal Handlers
  const handleOpenDeleteAttribute = (attr: VendorAttribute) => {
    setDeleteTarget({
      type: 'attribute',
      attributeId: attr.id,
      attributeName: attr.name,
    });
    setIsDeleteModalOpen(true);
  };

  const handleOpenDeleteValue = (
    attr: VendorAttribute,
    val: VendorAttributeValue
  ) => {
    setDeleteTarget({
      type: 'value',
      attributeId: attr.id,
      attributeName: attr.name,
      valueId: val.id,
      valueName: val.value,
    });
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'attribute') {
      await deleteAttributeMutation.mutateAsync(deleteTarget.attributeId);
    } else if (deleteTarget.valueId) {
      await deleteValueMutation.mutateAsync({
        attributeId: deleteTarget.attributeId,
        valueId: deleteTarget.valueId,
      });
    }
    handleCloseDeleteModal();
  };

  return (
    <>
      {/* Top Header */}
      <div className="sidebar-page-container-header bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="heading-page-title">{t('attributes.title', 'Attributes')}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {t(
              'attributes.subtitle',
              'Configure reusable option attributes and values for your products.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateAttribute}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 active:bg-gray-950 text-white text-sm font-semibold rounded-xl transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <Plus size={18} />
          <span>{t('attributes.createBtn', 'Add Attribute')}</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="sidebar-page-container flex-1 overflow-y-auto pt-0 pb-10">
        {/* Search & Filter Toolbar */}
        {!isLoading && attributes.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none rtl:left-auto rtl:right-3">
                <Search size={17} />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t(
                  'attributes.searchPlaceholder',
                  'Search attributes or values...'
                )}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all shadow-2xs rtl:pl-4 rtl:pr-9"
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <AttributeSkeleton />}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-red-900 mb-1">
              {t('attributes.error.title', 'Failed to load attributes')}
            </h3>
            <p className="text-sm text-red-600 mb-4">
              {(error as any)?.message ||
                t(
                  'attributes.error.description',
                  'An unexpected error occurred while fetching attributes.'
                )}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              {t('attributes.error.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Empty States */}
        {!isLoading && !isError && attributes.length === 0 && (
          <AttributeEmptyState onCreateAttribute={handleOpenCreateAttribute} />
        )}

        {!isLoading &&
          !isError &&
          attributes.length > 0 &&
          filteredAttributes.length === 0 && (
            <AttributeEmptyState
              isSearchEmpty
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          )}

        {/* Attributes Grid List */}
        {!isLoading && !isError && filteredAttributes.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredAttributes.map((attr) => (
              <motion.div key={attr.id} variants={itemVariants}>
                <AttributeCard
                  attribute={attr}
                  onEditAttribute={handleOpenEditAttribute}
                  onDeleteAttribute={handleOpenDeleteAttribute}
                  onAddValue={handleOpenAddValue}
                  onEditValue={handleOpenEditValue}
                  onDeleteValue={handleOpenDeleteValue}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Modals */}
      <AttributeFormModal
        isOpen={isAttributeModalOpen}
        onClose={handleCloseAttributeModal}
        attribute={selectedAttributeForEdit}
        onSubmit={handleSubmitAttributeForm}
        isSubmitting={
          createAttributeMutation.isPending || updateAttributeMutation.isPending
        }
      />

      <AttributeValueModal
        isOpen={isValueModalOpen}
        onClose={handleCloseValueModal}
        attribute={activeParentAttribute}
        value={selectedValueForEdit}
        onSubmit={handleSubmitValueForm}
        isSubmitting={
          addValueMutation.isPending || updateValueMutation.isPending
        }
      />

      <AttributeDeleteModal
        isOpen={isDeleteModalOpen}
        target={deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={
          deleteAttributeMutation.isPending || deleteValueMutation.isPending
        }
      />
    </>
  );
};

export default Attributes;
