import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import type { AdminAccount } from '../types';
import i18n from '../../../i18n';

export const AdminsList: React.FC = () => {
  const { t } = useTranslation();
  const { admins, setViewMode, setEditingAdmin, openDeleteAdminModal } = useAdminSettingsStore();
  const isArabic = i18n.language === 'ar';
  const ChevronIcon = isArabic ? ChevronLeft : ChevronRight;

  const handleEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setViewMode('admins-edit');
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.name', { defaultValue: 'Name' })}</th>
                <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.email', { defaultValue: 'Email' })}</th>
                <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.role', { defaultValue: 'Role' })}</th>
                <th className="py-4 px-6">{t('adminSettings.adminAccounts.table.dateAdded', { defaultValue: 'Date Added' })}</th>
                <th className="py-4 px-6 text-right rtl:text-left">{t('adminSettings.adminAccounts.table.actions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Avatar & Name */}
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    <div className="flex items-center gap-3">
                      {admin.avatarUrl ? (
                        <img
                          src={admin.avatarUrl}
                          alt={admin.name}
                          className="size-9 rounded-full object-cover border border-gray-100 shrink-0"
                        />
                      ) : (
                        <div className="size-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs shrink-0">
                          {admin.name ? admin.name.charAt(0).toUpperCase() : <User size={16} />}
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{admin.name}</span>
                    </div>
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

                  {/* Actions */}
                  <td className="py-4 px-6 text-right rtl:text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(admin)}
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Admin"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteAdminModal(admin)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Admin"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No admin accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
