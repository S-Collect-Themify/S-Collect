import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Clock, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { logout } from '../../services/auth';

interface OnboardingStatusProps {
  status: 'PENDING_APPROVAL' | 'REJECTED' | string;
  rejectionReason: string | null;
  onRetry: () => void;
}

const OnboardingStatus = ({
  status,
  rejectionReason,
  onRetry,
}: OnboardingStatusProps) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const isRtl = i18n.language === 'ar';

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-[480px] bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center animate-fade-in-up">
        {status === 'PENDING_APPROVAL' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 inline-flex items-center justify-center mb-6 text-amber-500 animate-pulse">
              <Clock size={32} />
            </div>
            <h2 className="text-h5 font-bold text-gray-900 mb-3">
              {isRtl
                ? 'طلبك قيد المراجعة حالياً'
                : 'Your Application is Under Review'}
            </h2>
            <p className="text-body-md text-gray-500 leading-relaxed mb-6">
              {isRtl
                ? 'شكراً لتقديم طلب الانضمام كتاجر. فريقنا يقوم بمراجعة معلومات متجرك والتحقق من السجل التجاري. سنقوم بإشعارك بمجرد تفعيل حسابك.'
                : 'Thank you for applying to become a vendor. Our team is currently reviewing your store information and commercial registration. We will notify you as soon as your account is activated.'}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 inline-flex items-center justify-center mb-6 text-red">
              <XCircle size={32} />
            </div>
            <h2 className="text-h5 font-bold text-gray-900 mb-3">
              {isRtl ? 'تم رفض طلب الانضمام' : 'Application Rejected'}
            </h2>
            <p className="text-body-md text-gray-500 leading-relaxed mb-4">
              {isRtl
                ? 'نأسف لإبلاغك بأنه قد تم رفض طلب انضمامك كتاجر للأسباب التالية:'
                : 'We regret to inform you that your application to become a vendor has been rejected due to the following reason:'}
            </p>
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 mb-6 text-right">
              <p className="text-body-sm text-red font-semibold leading-relaxed">
                {rejectionReason ||
                  (isRtl
                    ? 'لم يتم تحديد سبب الرفض.'
                    : 'No rejection reason specified.')}
              </p>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 bg-gray-900 text-gray-50 rounded-lg text-label-md font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            {isRtl ? 'تحديث الحالة' : 'Check Status'}
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 py-3 px-4 bg-white text-gray-700 border border-gray-300 rounded-lg text-label-md font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            {isRtl ? 'تسجيل الخروج' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatus;
