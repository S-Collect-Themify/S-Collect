import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LogoutModal from './LogoutModal';
import { useTranslation } from 'react-i18next';
import { logout, clearTokens } from '../../services/auth';

const LogoutButton = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearTokens();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
      setOpen(false);
      setLoading(false);
    }
  };
  const { t } = useTranslation();
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-gray-50 hover:bg-gray-500/40 hover:text-gray-100 px-3 py-2 rounded-md transition cursor-pointer focus:outline-none w-full "
      >
        <LogOut size={18} />
        <span className="truncate">{t('sidebar.items.logout')}</span>
      </button>

      <LogoutModal
        open={open}
        loading={loading}
        onClose={() => setOpen(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};

export default LogoutButton;
