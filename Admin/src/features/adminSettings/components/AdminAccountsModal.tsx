import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
}

interface AdminAccountsModalProps {
  open: boolean;
  onClose: () => void;
}

const INITIAL_ADMINS: AdminAccount[] = [
  { id: '1', name: 'Ahmed Hassan', email: 'ahmed@collects.com', role: 'Super Admin', status: 'Active' },
  { id: '2', name: 'Sara Al-Otaibi', email: 'sara@collects.com', role: 'Finance Admin', status: 'Active' },
  { id: '3', name: 'Omar Mansour', email: 'omar@collects.com', role: 'Support Lead', status: 'Active' },
];

export const AdminAccountsModal: React.FC<AdminAccountsModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState<AdminAccount[]>(INITIAL_ADMINS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Admin');

  if (!open) return null;

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newAdmin: AdminAccount = {
      id: String(Date.now()),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'Active',
    };

    setAdmins([...admins, newAdmin]);
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  const handleDeleteAdmin = (id: string) => {
    setAdmins(admins.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="size-10 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {t('adminSettings.adminAccounts.title', { defaultValue: 'Admin Accounts' })}
            </h2>
            <p className="text-xs text-gray-500">
              {t('adminSettings.adminAccounts.description', {
                defaultValue: 'Manage platform admin accounts and permissions',
              })}
            </p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {admins.length} {admins.length === 1 ? 'Admin Account' : 'Admin Accounts'}
          </span>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-black hover:bg-gray-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={14} />
            Add Admin Account
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddAdmin} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Finance Admin">Finance Admin</option>
                <option value="Support Lead">Support Lead</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs text-white bg-black rounded-lg hover:bg-gray-800"
              >
                Add Account
              </button>
            </div>
          </form>
        )}

        {/* Admins Table / List */}
        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Admin Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right rtl:text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50">
                  <td className="py-3 px-4 font-semibold text-gray-900">{admin.name}</td>
                  <td className="py-3 px-4 text-gray-500">{admin.email}</td>
                  <td className="py-3 px-4">
                    <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-full">
                      {admin.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right rtl:text-left">
                    <button
                      type="button"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Remove Account"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
