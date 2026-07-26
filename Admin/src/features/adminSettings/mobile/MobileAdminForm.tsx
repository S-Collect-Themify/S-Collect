import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, ChevronLeft, Upload, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminSettingsStore } from '../store';
import i18n from '../../../i18n';

interface MobileAdminFormProps {
  mode: 'add' | 'edit';
}

interface AdminFormInputs {
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

const ROLES = ['Admin', 'Super Admin'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const MobileAdminForm: React.FC<MobileAdminFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { addAdmin, updateAdmin, editingAdmin, setViewMode } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const BreadcrumbChevron = isArabic ? ChevronLeft : ChevronRight;

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    mode === 'edit' ? editingAdmin?.avatarUrl : undefined
  );
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormInputs>({
    defaultValues: {
      name: editingAdmin?.name || '',
      email: editingAdmin?.email || '',
      role: editingAdmin?.role || 'Admin',
      phoneNumber: editingAdmin?.phoneNumber || '',
      avatarUrl: editingAdmin?.avatarUrl || '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && editingAdmin) {
      setValue('name', editingAdmin.name);
      setValue('email', editingAdmin.email);
      setValue('role', editingAdmin.role);
      setValue('phoneNumber', editingAdmin.phoneNumber || '');
      setValue('avatarUrl', editingAdmin.avatarUrl || '');
      setAvatarPreview(editingAdmin.avatarUrl);
    }
  }, [mode, editingAdmin, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const msg = isArabic
        ? 'حجم الصورة يجب ألا يتجاوز 2MB'
        : 'Image file size must be 2MB or less';
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

  const onSubmit = (data: AdminFormInputs) => {
    if (mode === 'add') {
      const success = addAdmin({
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
        phoneNumber: data.phoneNumber?.trim(),
        avatarUrl: avatarPreview,
      });
      if (success) {
        setViewMode('admins');
      }
    } else if (editingAdmin) {
      const success = updateAdmin(editingAdmin.id, {
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role,
        phoneNumber: data.phoneNumber?.trim(),
        avatarUrl: avatarPreview,
      });
      if (success) {
        setViewMode('admins');
      }
    }
  };

  return (
    <div className="space-y-5 w-full pb-8">
      {/* Header & Breadcrumbs */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">
          {mode === 'add'
            ? t('adminSettings.adminForm.addTitle', { defaultValue: 'Add New Admin' })
            : t('adminSettings.adminForm.editTitle', { defaultValue: 'Edit Admin' })}
        </h1>

        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
          <button
            type="button"
            onClick={() => setViewMode('settings')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
          </button>
          <BreadcrumbChevron size={10} />
          <button
            type="button"
            onClick={() => setViewMode('admins')}
            className="hover:text-gray-700 transition-colors cursor-pointer"
          >
            {t('adminSettings.adminAccounts.title', { defaultValue: 'Admins' })}
          </button>
          <BreadcrumbChevron size={10} />
          <span className="text-gray-600 font-semibold">
            {mode === 'add'
              ? t('adminSettings.adminForm.addTitle', { defaultValue: 'Add New Admin' })
              : t('adminSettings.adminForm.editTitle', { defaultValue: 'Edit Admin' })}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Admin Profile Image Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {t('adminSettings.adminAccounts.profileImage', {
                defaultValue: 'Admin Profile Image (Optional, Max 2MB)',
              })}
            </label>
            <div className="flex items-center gap-3.5">
              {avatarPreview ? (
                <div className="relative size-14 rounded-full overflow-hidden border border-gray-200 shrink-0 group">
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
                <div className="size-14 rounded-full bg-gray-100 border border-dashed border-gray-300 text-gray-400 flex items-center justify-center shrink-0">
                  <User size={22} />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs">
                  <Upload size={14} />
                  <span>
                    {t('adminSettings.adminAccounts.chooseFile', { defaultValue: 'Choose File' })}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">
                  {isArabic
                    ? 'الصيغ المدعومة: JPG, PNG, WEBP (الحد الأقصى 2MB)'
                    : 'JPG, PNG, WEBP — Max 2MB'}
                </p>
                {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="mob-admin-name"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.adminForm.nameLabel', { defaultValue: 'Full Name' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-name"
              type="text"
              {...register('name', {
                required: isArabic ? 'الاسم مطلوب' : 'Full name is required',
              })}
              placeholder="e.g. John Doe"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.name ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1.5">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="mob-admin-email"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.adminForm.emailLabel', { defaultValue: 'Email Address' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-email"
              type="email"
              {...register('email', {
                required: isArabic ? 'البريد الإلكتروني مطلوب' : 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: isArabic
                    ? 'يرجى إدخال بريد إلكتروني صحيح'
                    : 'Please enter a valid email address',
                },
              })}
              placeholder="e.g. john@platform.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1.5">{errors.email.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="mob-admin-role"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.adminForm.roleLabel', { defaultValue: 'Role' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                id="mob-admin-role"
                {...register('role', {
                  required: isArabic ? 'الدور مطلوب' : 'Role is required',
                })}
                className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-10 cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 rtl:right-auto rtl:left-0">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.role && (
              <p className="text-xs text-red-500 mt-1.5">{errors.role.message}</p>
            )}
          </div>

          {/* Phone Number (Optional) */}
          <div>
            <label
              htmlFor="mob-admin-phone"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              {t('adminSettings.adminForm.phoneLabel', { defaultValue: 'Phone Number (Optional)' })}
            </label>
            <input
              id="mob-admin-phone"
              type="text"
              {...register('phoneNumber')}
              placeholder="+966 50 000 0000"
              className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              {mode === 'add'
                ? t('adminSettings.adminForm.addBtn', { defaultValue: 'Add Admin' })
                : t('banners.form.saveChanges', { defaultValue: 'Save Changes' })}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('admins')}
              className="w-full py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('banners.form.cancel', { defaultValue: 'Cancel' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
