import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, Info, ArrowLeft, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLeftPanel from '../../components/auth/AuthLeftPanel';
import { changePassword, forgotPassword, resetPassword } from '../../services/auth';
import { getErrorMessage } from '../../types/api';
import toast from 'react-hot-toast';

interface ForgetPassFormValues {
  // Mode A: Change Temp Password
  tempPassword?: string;
  
  // Mode B: Forgot Password
  email?: string;
  code?: string;

  // Shared
  newPassword?: string;
  confirmPassword?: string;
}

const ForgetPass = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isForgotMode = searchParams.get('mode') === 'forgot';

  const [showTempPass, setShowTempPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgetPassFormValues>({
    defaultValues: {
      tempPassword: '',
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    }
  });

  const newPassword = watch('newPassword');
  const isRtl = i18n.language === 'ar';

  const onSubmit = async (data: ForgetPassFormValues) => {
    setLoading(true);
    setError('');

    try {
      if (isForgotMode) {
        if (!otpSent) {
          // Step 1: Send forgot password request
          if (!data.email) return;
          await forgotPassword(data.email);
          setSubmittedEmail(data.email);
          setOtpSent(true);
          toast.success(isRtl ? 'تم إرسال رمز التحقق بنجاح' : 'Verification code sent successfully');
        } else {
          // Step 2: Reset password using code
          if (!submittedEmail || !data.code || !data.newPassword) return;
          await resetPassword(submittedEmail, data.code, data.newPassword);
          toast.success(isRtl ? 'تم تغيير كلمة المرور بنجاح' : 'Password reset successfully');
          navigate('/login');
        }
      } else {
        // Mode A: Change Temporary Password
        if (!data.tempPassword || !data.newPassword) return;
        await changePassword(data.tempPassword, data.newPassword);
        toast.success(isRtl ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
        navigate('/');
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, isRtl ? 'فشلت العملية. يرجى المحاولة مرة أخرى.' : 'Operation failed. Please try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <AuthLeftPanel />

      <div className="flex-1 bg-gray-50 flex items-start justify-center px-6 md:px-10 py-12 overflow-y-auto">
        <div className="w-full max-w-md mt-6 lg:mt-32">
          {/* Back button for Forgot Mode */}
          {isForgotMode && (
            <button
              onClick={() => {
                if (otpSent) {
                  setOtpSent(false);
                  setError('');
                } else {
                  navigate('/login');
                }
              }}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 text-label-md font-medium cursor-pointer"
            >
              <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''} />
              {isRtl ? 'رجوع' : 'Back'}
            </button>
          )}

          <div className="flex justify-center mb-4 animate-fade-in-up" style={{ animationDelay: '0s' }}>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <KeyRound size={20} className="text-gray-700" />
            </div>
          </div>

          <h1
            className="lg:text-h4 text-h5 font-bold text-gray-900 text-center animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            {isForgotMode
              ? otpSent
                ? isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password'
                : isRtl ? 'نسيت كلمة المرور؟' : 'Forgot Password?'
              : t('forgetPass.title')}
          </h1>

          <p
            className="text-center text-body-md text-gray-500 mt-3 mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            {isForgotMode
              ? otpSent
                ? isRtl
                  ? `أدخل رمز التحقق المرسل إلى ${submittedEmail}`
                  : `Enter the verification code sent to ${submittedEmail}`
                : isRtl
                  ? 'أدخل بريدك الإلكتروني لإرسال رمز التحقق وتعيين كلمة مرور جديدة.'
                  : 'Enter your email address to receive a verification code and reset your password.'
              : t('forgetPass.subtitle')}
          </p>

          {/* Warning Banner for Temporary Password Change */}
          {!isForgotMode && (
            <div
              className="flex items-center gap-2 bg-blue-light border border-blue-100 text-blue-700 text-body-sm rounded-lg px-4 py-3 mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <Info size={14} className="shrink-0" />
              {t('forgetPass.alert')}
            </div>
          )}

          {error && (
            <div className="bg-red-light border border-red rounded-lg px-3.5 py-2.5 text-red text-body-sm mb-6 animate-fade-in-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            
            {/* 1. Request Reset Screen (Email Input) */}
            {isForgotMode && !otpSent && (
              <div>
                <label className="block text-label-sm text-gray-700 mb-1.5">
                  {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                  className={`w-full border rounded-lg px-3 py-2.5 text-body-md text-gray-900 outline-none focus:border-gray-900 placeholder:text-gray-400 transition-colors ${
                    errors.email ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
                  }`}
                  {...register('email', {
                    required: isRtl ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: isRtl ? 'بريد إلكتروني غير صالح' : 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red text-caption-sm mt-1">{errors.email.message}</p>
                )}
              </div>
            )}

            {/* 2. Reset Screen (OTP Input) */}
            {isForgotMode && otpSent && (
              <div>
                <label className="block text-label-sm text-gray-700 mb-1.5">
                  {isRtl ? 'رمز التحقق (OTP)' : 'Verification Code (OTP)'}
                </label>
                <input
                  type="text"
                  placeholder={isRtl ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit code'}
                  className={`w-full border rounded-lg px-3 py-2.5 text-body-md text-gray-900 outline-none focus:border-gray-900 placeholder:text-gray-400 transition-colors text-center tracking-widest font-mono ${
                    errors.code ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
                  }`}
                  {...register('code', {
                    required: isRtl ? 'رمز التحقق مطلوب' : 'Verification code is required',
                  })}
                />
                {errors.code && (
                  <p className="text-red text-caption-sm mt-1">{errors.code.message}</p>
                )}
              </div>
            )}

            {/* 3. Temporary Password Input (Mode A only) */}
            {!isForgotMode && (
              <div>
                <label className="block text-label-sm text-gray-700 mb-1.5">
                  {t('forgetPass.tempPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showTempPass ? 'text' : 'password'}
                    placeholder={t('forgetPass.tempPasswordPlaceholder')}
                    className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-body-md text-gray-900 outline-none focus:border-gray-900 placeholder:text-gray-400 transition-colors ${
                      errors.tempPassword ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
                    }`}
                    {...register('tempPassword', {
                      required: t('forgetPass.errors.tempPasswordRequired'),
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPass(!showTempPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showTempPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.tempPassword && (
                  <p className="text-red text-caption-sm mt-1">{errors.tempPassword.message}</p>
                )}
              </div>
            )}

            {/* 4. New Password Input (Shared for reset & temp change) */}
            {(!isForgotMode || otpSent) && (
              <>
                <div>
                  <label className="block text-label-sm text-gray-700 mb-1.5">
                    {isForgotMode ? (isRtl ? 'كلمة المرور الجديدة' : 'New Password') : t('forgetPass.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      placeholder={isForgotMode ? (isRtl ? 'أدخل كلمة المرور الجديدة' : 'Enter new password') : t('forgetPass.newPasswordPlaceholder')}
                      className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-body-md text-gray-900 outline-none focus:border-gray-900 placeholder:text-gray-400 transition-colors ${
                        errors.newPassword ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
                      }`}
                      {...register('newPassword', {
                        required: isRtl ? 'كلمة المرور مطلوبة' : 'Password is required',
                        minLength: {
                          value: 8,
                          message: isRtl ? 'يجب ألا تقل كلمة المرور عن 8 أحرف' : 'Password must be at least 8 characters',
                        },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*\d).+$/,
                          message: isRtl ? 'يجب أن تحتوي كلمة المرور على حرف كبير ورقم واحد على الأقل' : 'Password must contain at least one uppercase letter and one number',
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red text-caption-sm mt-1">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-label-sm text-gray-700 mb-1.5">
                    {isForgotMode ? (isRtl ? 'تأكيد كلمة المرور' : 'Confirm Password') : t('forgetPass.confirmPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder={isForgotMode ? (isRtl ? 'أعد كتابة كلمة المرور' : 'Repeat your password') : t('forgetPass.confirmPasswordPlaceholder')}
                      className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-body-md text-gray-900 outline-none focus:border-gray-900 placeholder:text-gray-400 transition-colors ${
                        errors.confirmPassword ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
                      }`}
                      {...register('confirmPassword', {
                        required: isRtl ? 'تأكيد كلمة المرور مطلوب' : 'Please confirm your password',
                        validate: (val) =>
                          val === newPassword ||
                          (isRtl ? 'كلمات المرور غير متطابقة' : 'Passwords do not match'),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red text-caption-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gray-900 text-gray-50 py-3 rounded-lg text-label-md font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {isForgotMode
                ? otpSent
                  ? isRtl ? 'إعادة تعيين كلمة المرور' : 'Reset Password'
                  : isRtl ? 'إرسال رمز التحقق' : 'Send Code'
                : t('forgetPass.submit')}
            </button>
          </form>

          {isForgotMode && !otpSent && (
            <p className="text-center mt-5 text-body-sm text-gray-500">
              {isRtl ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
              <Link to="/login" className="text-gray-900 font-semibold hover:underline">
                {isRtl ? 'تسجيل الدخول' : 'Log In'}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgetPass;
