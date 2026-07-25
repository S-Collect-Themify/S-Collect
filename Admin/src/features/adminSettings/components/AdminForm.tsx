import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft, Upload, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSettingsStore } from '../store';
import i18n from '../../../i18n';

interface AdminFormData {
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

interface AdminFormProps {
  mode: 'add' | 'edit';
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

export const AdminForm: React.FC<AdminFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { setViewMode, addAdmin, updateAdmin, editingAdmin } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    mode === 'edit' ? editingAdmin?.avatarUrl : undefined
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    defaultValues: {
      name: mode === 'edit' ? editingAdmin?.name || '' : '',
      email: mode === 'edit' ? editingAdmin?.email || '' : '',
      role: mode === 'edit' ? editingAdmin?.role || 'Admin' : 'Admin',
      phoneNumber: mode === 'edit' ? editingAdmin?.phoneNumber || '' : '',
      avatarUrl: mode === 'edit' ? editingAdmin?.avatarUrl || '' : '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const msg = t('adminSettings.fileTooLarge', { defaultValue: 'Image file size must be 2MB or less' });
      setFileError(msg);
      toast.error(msg);
      return;
    }

    setFileError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setValue('avatarUrl', result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(undefined);
    setValue('avatarUrl', '');
    setFileError(null);
  };

  const onSubmit = (data: AdminFormData) => {
    if (mode === 'add') {
      addAdmin({
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        avatarUrl: avatarPreview,
      });
    } else if (mode === 'edit' && editingAdmin) {
      updateAdmin(editingAdmin.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        phoneNumber: data.phoneNumber,
        avatarUrl: avatarPreview,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title & Breadcrumbs */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'add'
            ? t('adminSettings.adminAccounts.addTitle', { defaultValue: 'Add New Admin' })
            : t('adminSettings.adminAccounts.editTitle', { defaultValue: 'Edit Admin' })}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <ChevronIcon size={12} />
          <button
            type="button"
            onClick={() => setViewMode('admins')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            {t('adminSettings.adminAccounts.title', { defaultValue: 'Admins' })}
          </button>
          <ChevronIcon size={12} />
          <span className="text-gray-900 font-semibold">
            {mode === 'add'
              ? t('adminSettings.adminAccounts.addTitle', { defaultValue: 'Add New Admin' })
              : t('adminSettings.adminAccounts.editTitle', { defaultValue: 'Edit Admin' })}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar Upload Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {t('adminSettings.adminAccounts.profileImage', {
                defaultValue: 'Admin Profile Image (Optional, Max 2MB)',
              })}
            </label>
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <div className="relative size-16 rounded-full overflow-hidden border border-gray-200 shrink-0 group">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove Image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="size-16 rounded-full bg-gray-100 border border-dashed border-gray-300 text-gray-400 flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
              )}

              <div className="flex-1">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs">
                  <Upload size={14} />
                  {t('adminSettings.adminAccounts.chooseFile', { defaultValue: 'Choose File' })}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1">
                  {t('adminSettings.adminAccounts.imageHint', {
                    defaultValue: 'Supported formats: JPG, PNG, WEBP. Maximum file size: 2MB.',
                  })}
                </p>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('adminSettings.adminAccounts.fullName', { defaultValue: 'Full Name' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('adminSettings.adminAccounts.fullNamePlaceholder', {
                defaultValue: 'e.g. John Doe',
              })}
              {...register('name', {
                required: t('adminSettings.adminAccounts.nameRequired', {
                  defaultValue: 'Full name is required',
                }),
              })}
              className={`w-full bg-white border ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t('adminSettings.adminAccounts.emailAddress', { defaultValue: 'Email Address' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder={t('adminSettings.adminAccounts.emailPlaceholder', {
                defaultValue: 'e.g. john@platform.com',
              })}
              {...register('email', {
                required: t('adminSettings.adminAccounts.emailRequired', {
                  defaultValue: 'Email address is required',
                }),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('adminSettings.adminAccounts.emailInvalid', {
                    defaultValue: 'Invalid email address',
                  }),
                },
              })}
              className={`w-full bg-white border ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Role & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('adminSettings.adminAccounts.role', { defaultValue: 'Role' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <select
                {...register('role', {
                  required: t('adminSettings.adminAccounts.roleRequired', {
                    defaultValue: 'Role is required',
                  }),
                })}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Finance Admin">Finance Admin</option>
                <option value="Support Lead">Support Lead</option>
              </select>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t('adminSettings.adminAccounts.phoneNumber', {
                  defaultValue: 'Phone Number (Optional)',
                })}
              </label>
              <input
                type="text"
                placeholder={t('adminSettings.adminAccounts.phoneNumberPlaceholder', {
                  defaultValue: '+966 50 000 0000',
                })}
                {...register('phoneNumber')}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setViewMode('admins')}
              className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {mode === 'add'
                ? t('adminSettings.adminAccounts.addAdminBtn', { defaultValue: 'Add Admin' })
                : t('adminSettings.adminAccounts.saveChangesBtn', { defaultValue: 'Save Changes' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
