import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData } from '../hooks/useAdminsData';
import { AdminsSkeleton } from './skeletons/AdminsSkeleton';
import Toggle from '../../../components/ui/Toggle';
import type { AdminAccount } from '../types';
import i18n from '../../../i18n';

export const AdminsList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewMode, setEditingAdmin, openDeleteAdminModal } = useAdminSettingsStore();
  const { admins, isLoading, toggleStatusMutation } = useAdminsData();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const handleToggleStatus = (admin: AdminAccount) => {
    toggleStatusMutation.mutate({ id: admin.id, currentStatus: admin.status });
  };

  const handleDelete = (admin: AdminAccount) => {
    openDeleteAdminModal(admin);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Admin':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {t('adminSettings.adminAccounts.title', { defaultValue: 'Admins' })}
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
            <span className="text-gray-900 font-semibold">
              {t('adminSettings.adminAccounts.title', { defaultValue: 'Admins' })}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingAdmin(null);
            setViewMode('admins-add');
          }}
          className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus size={14} />
          {t('adminSettings.adminAccounts.addBtn', { defaultValue: 'Add New Admin' })}
        </button>
      </div>

      {/* Admins Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <AdminsSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.name', { defaultValue: 'Name' })}</th>
                  <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.email', { defaultValue: 'Email' })}</th>
                  <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.role', { defaultValue: 'Role' })}</th>
                  <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.dateAdded', { defaultValue: 'Date Added' })}</th>
                  <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.status', { defaultValue: 'Status' })}</th>
                  <th className="py-4 px-6 text-right rtl:text-left">{t('adminSettings.adminAccounts.table.actions', { defaultValue: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.map((admin) => {
                  const isSuperAdmin =
                    admin.role === 'Super Admin' || admin.role?.toUpperCase() === 'SUPER_ADMIN';

                  return (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Name (No Avatar Image) */}
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {admin.name}
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-gray-500">{admin.email}</td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full font-medium text-xs inline-block ${getRoleBadgeColor(
                            admin.role
                          )}`}
                        >
                          {admin.role}
                        </span>
                      </td>

                      {/* Date Added */}
                      <td className="py-4 px-6 text-gray-500">{admin.dateAdded}</td>

                      {/* Status Toggle & Badge */}
                      <td className="py-4 px-6">
                        {admin.status ? (
                          <div className="flex items-center gap-2.5">
                            {!isSuperAdmin && (
                              <Toggle
                                checked={admin.status === 'Active'}
                                onChange={() => handleToggleStatus(admin)}
                              />
                            )}
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                admin.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                                  : 'bg-red-50 text-red-500 border border-red-100/50'
                              }`}
                            >
                              {admin.status === 'Active'
                                ? t('common.active', { defaultValue: 'Active' })
                                : t('common.inactive', { defaultValue: 'Inactive' })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-300 font-medium">-</span>
                        )}
                      </td>

                    {/* Actions (Delete only) */}
                    <td className="py-4 px-6 text-right rtl:text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(admin)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Admin"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No admin accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
