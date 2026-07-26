import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, SquarePen, Trash2, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAdminSettingsStore } from '../store';
import type { AdminAccount } from '../types';
import i18n from '../../../i18n';

export const MobileAdminsList: React.FC = () => {
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
        return 'bg-blue-50 text-blue-600 border border-blue-100/50';
      case 'Admin':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-100/50';
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
      </div>

      {/* Admins Card List */}
      {admins.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400 text-xs border border-gray-100 shadow-2xs">
          {t('adminSettings.adminAccounts.noAdmins', { defaultValue: 'No admin accounts found.' })}
        </div>
      ) : (
        <div className="space-y-3.5">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs hover:border-gray-200 transition-all"
            >
              {/* Top Row: Avatar & Info + Role Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {admin.avatarUrl ? (
                    <img
                      src={admin.avatarUrl}
                      alt={admin.name}
                      className="size-10 rounded-full object-cover border border-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-xs shrink-0">
                      {admin.name ? admin.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-0.5 truncate">
                      {admin.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-normal truncate">
                      {admin.email}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium text-xs shrink-0 inline-block ${getRoleBadgeColor(
                    admin.role
                  )}`}
                >
                  {admin.role}
                </span>
              </div>

              {/* Bottom Row: Date Added & Action Icons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-3">
                <div>
                  <span className="text-[11px] text-gray-400 block font-normal">
                    {t('adminSettings.adminAccounts.table.dateAdded', { defaultValue: 'Date Added' })}
                  </span>
                  <span className="text-xs text-gray-900 font-semibold block">
                    {admin.dateAdded}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(admin)}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-black transition-colors cursor-pointer"
                    title="Edit Admin"
                  >
                    <SquarePen size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteAdminModal(admin)}
                    className="p-1.5 rounded-lg border border-red-100 bg-red-50/40 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Delete Admin"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
