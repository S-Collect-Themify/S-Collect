import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData, isValidSaudiPhone, normalizeSaudiPhone } from '../hooks/useAdminsData';
import i18n from '../../../i18n';

interface AdminFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface AdminFormProps {
  mode: 'add' | 'edit';
}

export const AdminForm: React.FC<AdminFormProps> = ({ mode }) => {
  const { t } = useTranslation();
  const { setViewMode, updateAdmin, editingAdmin } = useAdminSettingsStore();
  const { createAdminMutation } = useAdminsData();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminFormData>({
    defaultValues: {
      firstName: mode === 'edit' ? editingAdmin?.firstName || editingAdmin?.name.split(' ')[0] || '' : '',
      lastName: mode === 'edit' ? editingAdmin?.lastName || editingAdmin?.name.split(' ').slice(1).join(' ') || '' : '',
      email: mode === 'edit' ? editingAdmin?.email || '' : '',
      phoneNumber: mode === 'edit' ? editingAdmin?.phoneNumber || '' : '',
    },
  });

  const onSubmit = (data: AdminFormData) => {
    const normalizedPhone = normalizeSaudiPhone(data.phoneNumber);
    if (mode === 'add') {
      createAdminMutation.mutate({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phoneNumber: normalizedPhone,
      });
    } else if (mode === 'edit' && editingAdmin) {
      updateAdmin(editingAdmin.id, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        name: `${data.firstName.trim()} ${data.lastName.trim()}`,
        email: data.email.trim(),
        phoneNumber: normalizedPhone,
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
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="admin-first-name" className="block text-xs font-semibold text-gray-700 mb-1">
                {t('adminSettings.adminAccounts.firstName', { defaultValue: 'First Name' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="admin-first-name"
                type="text"
                placeholder={t('adminSettings.adminAccounts.firstNamePlaceholder', {
                  defaultValue: 'e.g. John',
                })}
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
                className={`w-full bg-white border ${
                  errors.firstName ? 'border-red-500' : 'border-gray-200'
                } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors placeholder-gray-500`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="admin-last-name" className="block text-xs font-semibold text-gray-700 mb-1">
                {t('adminSettings.adminAccounts.lastName', { defaultValue: 'Last Name' })}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="admin-last-name"
                type="text"
                placeholder={t('adminSettings.adminAccounts.lastNamePlaceholder', {
                  defaultValue: 'e.g. Doe',
                })}
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
                className={`w-full bg-white border ${
                  errors.lastName ? 'border-red-500' : 'border-gray-200'
                } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors placeholder-gray-500`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-700 mb-1">
              {t('adminSettings.adminAccounts.emailAddress', { defaultValue: 'Email Address' })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-email"
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
              } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors placeholder-gray-500`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Saudi Phone Number */}
          <div>
            <label htmlFor="admin-phone" className="block text-xs font-semibold text-gray-700 mb-1">
              {t('adminSettings.adminAccounts.phoneNumber', {
                defaultValue: 'Saudi Phone Number',
              })}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="admin-phone"
              type="tel"
              placeholder={t('adminSettings.adminAccounts.phoneNumberPlaceholder', {
                defaultValue: '+966 50 000 0000',
              })}
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
              className={`w-full bg-white border ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-200'
              } rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-black transition-colors placeholder-gray-500`}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber.message}</p>
            )}
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
              disabled={createAdminMutation.isPending}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-2"
            >
              {createAdminMutation.isPending && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
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
