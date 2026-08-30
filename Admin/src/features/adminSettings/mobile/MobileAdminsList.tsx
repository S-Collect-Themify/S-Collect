import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import { useAdminsData } from '../hooks/useAdminsData';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { getToken, getDecodedToken } from '../../../services/auth';
import { AdminsSkeleton } from '../components/skeletons/AdminsSkeleton';
import Toggle from '../../../components/ui/Toggle';
import type { AdminAccount } from '../types';
import i18n from '../../../i18n';

export const MobileAdminsList: React.FC = () => {
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
    <div className="space-y-5 w-full pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-0.5">
            {t('adminSettings.adminAccounts.title', { defaultValue: 'Admins' })}
          </h1>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
            <button
              type="button"
              onClick={() => setViewMode('settings')}
              className="hover:text-black transition-colors cursor-pointer"
            >
              {t('banners.breadcrumb.settings', { defaultValue: 'Settings' })}
            </button>
            <ChevronIcon size={10} />
            <span className="text-gray-700 font-semibold">
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
            className="bg-black hover:bg-gray-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus size={14} />
            <span>{t('adminSettings.adminAccounts.addBtnShort', { defaultValue: 'Add Admin' })}</span>
          </button>
        )}
      </div>

      {/* Main Content: Centered message if not superadmin, or card list if superadmin */}
      {!isSuperAdmin ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-8 min-h-75 flex flex-col items-center justify-center text-center">
          <div className="size-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mb-3.5 text-amber-600">
            <ShieldAlert size={26} />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">
            {t('adminSettings.adminAccounts.restrictedAccessTitle', {
              defaultValue: 'Super Admin Access Required',
            })}
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
            {t('adminSettings.adminAccounts.restrictedAccessMessage', {
              defaultValue:
                'Only Super Administrators have permission to view, create, and manage the full list of admin accounts.',
            })}
          </p>
        </div>
      ) : isLoading ? (
        <AdminsSkeleton isMobile />
      ) : admins.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-2xs">
          {t('adminSettings.adminAccounts.noAdmins', { defaultValue: 'No admin accounts found.' })}
        </div>
      ) : (
        <div className="space-y-3.5">
          {admins.map((admin) => {
            const isSuperAdminRow =
              admin.role === 'Super Admin' || admin.role?.toUpperCase() === 'SUPER_ADMIN';

            return (
              <div
                key={admin.id}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs space-y-3 hover:border-gray-200 transition-colors"
              >
                {/* Top Row: Info (No Avatar) + Role Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {admin.name}
                    </h4>
                    <p className="text-[11px] text-gray-400 truncate">{admin.email}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-medium text-[10px] shrink-0 ${getRoleBadgeColor(
                      admin.role
                    )}`}
                  >
                    {getRoleLabel(admin.role)}
                  </span>
                </div>

                {/* Status Toggle Bar */}
                {admin.status && (
                  <div className="flex items-center justify-between py-2 border-t border-b border-gray-50 text-[11px]">
                    <span className="text-gray-400 font-medium">
                      {t('adminSettings.adminAccounts.table.status', { defaultValue: 'Status' })}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isSuperAdminRow && (
                        <Toggle
                          checked={admin.status === 'Active'}
                          onChange={() => handleToggleStatus(admin)}
                        />
                      )}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          admin.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50'
                            : 'bg-red-50 text-red-500 border border-red-100/50'
                        }`}
                      >
                        {getStatusLabel(admin.status)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Row: Date Added & Action Icon */}
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">
                      {t('adminSettings.adminAccounts.table.dateAdded', { defaultValue: 'Date Added' })}
                    </span>
                    <span className="text-gray-600 font-medium text-xs">
                      {admin.dateAdded || '-'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDelete(admin)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title={t('adminSettings.adminAccounts.deleteAdmin', { defaultValue: 'Delete Admin' })}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
