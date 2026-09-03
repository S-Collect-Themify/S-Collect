import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData } from '../hooks/useAdminsData';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { getToken, getDecodedToken } from '../../../services/auth';
import { AdminsSkeleton } from './skeletons/AdminsSkeleton';
import Toggle from '../../../components/ui/Toggle';
import type { AdminAccount } from '../types';
import i18n from '../../../i18n';

export const AdminsList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewMode, setEditingAdmin, openDeleteAdminModal, openReactivateAdminModal } = useAdminSettingsStore();
  const { admins, isLoading, toggleStatusMutation } = useAdminsData();
  const { admin: currentLoggedInAdmin } = useAdminProfile();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const token = getToken();
  const decoded = useMemo(() => getDecodedToken(token), [token]);
  const roleStr = (currentLoggedInAdmin?.role || decoded?.role || '').toUpperCase();
  const isSuperAdmin = roleStr === 'SUPER_ADMIN' || roleStr === 'SUPERADMIN' || roleStr === 'SUPER ADMIN';

  const handleToggleStatus = (admin: AdminAccount) => {
    if (admin.status !== 'Active') {
      openReactivateAdminModal(admin);
    } else {
      toggleStatusMutation.mutate({ id: admin.id, currentStatus: admin.status });
    }
  };

  const handleDelete = (admin: AdminAccount) => {
    openDeleteAdminModal(admin);
  };

  const getRoleLabel = (role: string) => {
    const r = (role || '').toUpperCase();
    if (r.includes('SUPER')) return t('adminSettings.adminAccounts.roles.superAdmin', { defaultValue: 'Super Admin' });
    if (r.includes('ADMIN')) return t('adminSettings.adminAccounts.roles.admin', { defaultValue: 'Admin' });
    return role;
  };

  const getStatusLabel = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'ACTIVE') return t('adminSettings.adminAccounts.statuses.active', { defaultValue: 'Active' });
    if (s === 'INACTIVE' || s === 'DEACTIVATED' || s === 'SUSPENDED') {
      return t('adminSettings.adminAccounts.statuses.inactive', { defaultValue: 'Inactive' });
    }
    return status || '-';
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

        {isSuperAdmin && (
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
        )}
      </div>

      {/* Main Content: Centered message if not superadmin, or table if superadmin */}
      {!isSuperAdmin ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-12 min-h-90 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-4 text-amber-600">
            <ShieldAlert size={30} />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">
            {t('adminSettings.adminAccounts.restrictedAccessTitle', {
              defaultValue: 'Super Admin Access Required',
            })}
          </h3>
          <p className="text-xs text-gray-500 max-w-md leading-relaxed">
            {t('adminSettings.adminAccounts.restrictedAccessMessage', {
              defaultValue:
                'Only Super Administrators have permission to view, create, and manage the full list of admin accounts.',
            })}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          {isLoading ? (
            <AdminsSkeleton />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs border-collapse">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-4 px-6 text-left rtl:text-right">{t('adminSettings.adminAccounts.table.name', { defaultValue: 'Name' })}</th>
                    <th className="py-4 px-6 text-left rtl:text-right">{t('adminSettings.adminAccounts.table.email', { defaultValue: 'Email' })}</th>
                    <th className="py-4 px-6 text-left rtl:text-right">{t('adminSettings.adminAccounts.table.role', { defaultValue: 'Role' })}</th>
                    <th className="py-4 px-6 text-left rtl:text-right">{t('adminSettings.adminAccounts.table.dateAdded', { defaultValue: 'Date Added' })}</th>
                    <th className="py-4 px-6 text-left rtl:text-right">{t('adminSettings.adminAccounts.table.status', { defaultValue: 'Status' })}</th>
                    <th className="py-4 px-6 text-right rtl:text-left">{t('adminSettings.adminAccounts.table.actions', { defaultValue: 'Actions' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => {
                    const r = (admin.role || '').toUpperCase();
                    const isSuperAdminRow =
                      admin.role === 'Super Admin' || r === 'SUPER_ADMIN' || r === 'SUPERADMIN' || r === 'SUPER ADMIN' || r.includes('SUPER');

                    return (
                      <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* Name (No Avatar Image) */}
                        <td className="py-4 px-6 font-semibold text-gray-900 text-left rtl:text-right">
                          {admin.name}
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-gray-500 text-left rtl:text-right">{admin.email}</td>

                        {/* Role Badge */}
                        <td className="py-4 px-6 text-left rtl:text-right">
                          <span
                            className={`px-3 py-1 rounded-full font-medium text-xs inline-block ${getRoleBadgeColor(
                              admin.role
                            )}`}
                          >
                            {getRoleLabel(admin.role)}
                          </span>
                        </td>

                        {/* Date Added */}
                        <td className="py-4 px-6 text-gray-500 text-left rtl:text-right">{admin.dateAdded}</td>

                        {/* Status Toggle & Badge */}
                        <td className="py-4 px-6 text-left rtl:text-right">
                          {admin.status ? (
                            <div className="flex items-center gap-2.5 rtl:justify-start">
                              {!isSuperAdminRow && (
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
                                {getStatusLabel(admin.status)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium">-</span>
                          )}
                        </td>

                      {/* Actions (Delete only for non-superadmin) */}
                      <td className="py-4 px-6 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-2">
                          {!isSuperAdminRow && (
                            <button
                              type="button"
                              onClick={() => handleDelete(admin)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title={t('adminSettings.adminAccounts.deleteAdmin', { defaultValue: 'Delete Admin' })}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {admins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        {t('adminSettings.adminAccounts.noAdmins', { defaultValue: 'No admin accounts found.' })}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
