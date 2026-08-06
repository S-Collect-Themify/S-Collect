import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData, isValidSaudiPhone, normalizeSaudiPhone } from '../hooks/useAdminsData';
import i18n from '../../../i18n';

interface MobileAdminFormProps {
  mode: 'add' | 'edit';
}

interface AdminFormInputs {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export const MobileAdminForm: React.FC<MobileAdminFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { updateAdmin, editingAdmin, setViewMode } = useAdminSettingsStore();
  const { createAdminMutation } = useAdminsData();
  const isArabic = i18n.language === 'ar';
  const BreadcrumbChevron = isArabic ? ChevronLeft : ChevronRight;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminFormInputs>({
    defaultValues: {
      firstName: mode === 'edit' ? editingAdmin?.firstName || editingAdmin?.name.split(' ')[0] || '' : '',
      lastName: mode === 'edit' ? editingAdmin?.lastName || editingAdmin?.name.split(' ').slice(1).join(' ') || '' : '',
      email: editingAdmin?.email || '',
      phoneNumber: editingAdmin?.phoneNumber || '',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && editingAdmin) {
      setValue('firstName', editingAdmin.firstName || editingAdmin.name.split(' ')[0] || '');
      setValue('lastName', editingAdmin.lastName || editingAdmin.name.split(' ').slice(1).join(' ') || '');
      setValue('email', editingAdmin.email);
      setValue('phoneNumber', editingAdmin.phoneNumber || '');
    }
  }, [mode, editingAdmin, setValue]);

  const onSubmit = (data: AdminFormInputs) => {
    const normalizedPhone = normalizeSaudiPhone(data.phoneNumber);
    if (mode === 'add') {
      createAdminMutation.mutate({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phoneNumber: normalizedPhone,
      });
    } else if (editingAdmin) {
      const success = updateAdmin(editingAdmin.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email.trim(),
        phoneNumber: normalizedPhone,
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
            ? t('adminSettings.adminAccounts.addTitle', { defaultValue: 'Add New Admin' })
            : t('adminSettings.adminAccounts.editTitle', { defaultValue: 'Edit Admin' })}
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
              ? t('adminSettings.adminAccounts.addTitle', { defaultValue: 'Add New Admin' })
              : t('adminSettings.adminAccounts.editTitle', { defaultValue: 'Edit Admin' })}
          </span>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <label
              htmlFor="mob-admin-firstname"
              className="text-xs font-semibold text-gray-900 mb-1 block"
            >
              {t('adminSettings.adminAccounts.firstName', { defaultValue: 'First Name' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-firstname"
              type="text"
              {...register('firstName', {
                required: t('adminSettings.adminAccounts.firstNameRequired', {
                  defaultValue: 'First name is required',
                }),
                minLength: {
                  value: 2,
                  message: t('adminSettings.adminAccounts.firstNameRequired', {
                    defaultValue: 'First name is required',
                  }),
                },
              })}
              placeholder={t('adminSettings.adminAccounts.firstNamePlaceholder', {
                defaultValue: 'e.g. John',
              })}
              className={`w-full border rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.firstName ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="mob-admin-lastname"
              className="text-xs font-semibold text-gray-900 mb-1 block"
            >
              {t('adminSettings.adminAccounts.lastName', { defaultValue: 'Last Name' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-lastname"
              type="text"
              {...register('lastName', {
                required: t('adminSettings.adminAccounts.lastNameRequired', {
                  defaultValue: 'Last name is required',
                }),
                minLength: {
                  value: 2,
                  message: t('adminSettings.adminAccounts.lastNameRequired', {
                    defaultValue: 'Last name is required',
                  }),
                },
              })}
              placeholder={t('adminSettings.adminAccounts.lastNamePlaceholder', {
                defaultValue: 'e.g. Doe',
              })}
              className={`w-full border rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.lastName ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="mob-admin-email"
              className="text-xs font-semibold text-gray-900 mb-1 block"
            >
              {t('adminSettings.adminAccounts.emailAddress', { defaultValue: 'Email Address' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-email"
              type="email"
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
              placeholder="e.g. john@platform.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Saudi Phone Number */}
          <div>
            <label
              htmlFor="mob-admin-phone"
              className="text-xs font-semibold text-gray-900 mb-1 block"
            >
              {t('adminSettings.adminAccounts.phoneNumber', {
                defaultValue: 'Saudi Phone Number',
              })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="mob-admin-phone"
              type="tel"
              {...register('phoneNumber', {
                required: t('adminSettings.adminAccounts.phoneNumberRequired', {
                  defaultValue: 'Saudi phone number is required',
                }),
                validate: (value) =>
                  isValidSaudiPhone(value) ||
                  t('adminSettings.adminAccounts.phoneInvalidSaudi', {
                    defaultValue:
                      'Please enter a valid Saudi phone number (e.g. +966500000000 or 0500000000)',
                  }),
              })}
              placeholder="+966 50 000 0000"
              className={`w-full border rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                errors.phoneNumber ? 'border-red-400 bg-red-50/20' : 'border-gray-200 bg-white'
              }`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-3">
            <button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="w-full py-3 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-2"
            >
              {createAdminMutation.isPending && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {mode === 'add'
                ? t('adminSettings.adminAccounts.addAdminBtn', { defaultValue: 'Add Admin' })
                : t('adminSettings.adminAccounts.saveChangesBtn', { defaultValue: 'Save Changes' })}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('admins')}
              className="w-full py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('common.cancel', { defaultValue: 'Cancel' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
