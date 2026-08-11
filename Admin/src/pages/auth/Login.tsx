import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  Clock3,
  LockKeyhole,
  TimerReset,
  UserRound,
} from 'lucide-react';
import AuthLeftPanel from '../../components/auth/AuthLeftPanel';
import { type LoginState, useAuthStore } from '../../store/authStore';
import { useLogin, type LoginFormValues } from '../../hooks/useLogin';
import { getToken, getRefreshToken, getTokenExpiration } from '../../services/auth';

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="icon-stroke"
  >
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [remainingTime, setRemainingTime] = useState<number>(14 * 60);

  const initialState: LoginState =
    searchParams.get('state') === 'locked'
      ? 'locked'
      : searchParams.get('state') === 'expired'
        ? 'expired'
        : 'default';
  const initialEmail =
    initialState === 'locked'
      ? 'locked-out@company.com'
      : initialState === 'expired'
        ? 'admin@active-store.com'
        : '';
  const initialPassword = initialState === 'locked' ? '••••••••' : '';

  const {
    showLoginPassword,
    loginState,
    initializeLogin,
    toggleLoginPassword,
  } = useAuthStore();

  const { login: executeLogin, isPending, error, reset } = useLogin();
  const loginError = error?.message;

  const isLocked = loginState === 'locked';
  const isExpired = loginState === 'expired';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: initialEmail,
      password: initialPassword,
    },
  });

  useEffect(() => {
    initializeLogin(initialState);
  }, [initialState, initializeLogin]);

  useEffect(() => {
    if (initialState === 'default') {
      const token = getToken();
      const refreshToken = getRefreshToken();
      if (token || refreshToken) {
        const exp = token ? getTokenExpiration(token) : null;
        if (!exp || exp > Date.now()) {
          navigate('/', { replace: true });
        }
      }
    }
  }, [initialState, navigate]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isLocked) {
      setRemainingTime(14 * 60); // reset to 14 minutes

      timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLocked]);

  const onSubmit = (data: LoginFormValues) => {
    if (isLocked) return;
    executeLogin(data);
  };

  const icon = isLocked ? (
    <LockKeyhole size={22} />
  ) : isExpired ? (
    <TimerReset size={22} />
  ) : (
    <UserRound size={22} />
  );
  const title = isLocked
    ? t('login.lockedTitle')
    : isExpired
      ? t('login.expiredTitle')
      : t('login.title');
  const subtitle = isLocked
    ? t('login.lockedSubtitle')
    : isExpired
      ? t('login.expiredSubtitle')
      : t('login.subtitle');

  const resetState = () => {
    if (loginState !== 'default') initializeLogin('default');
    if (error) reset();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">
      <AuthLeftPanel />

      <div className="flex-1 bg-gray-50 flex items-start justify-center px-5 py-8 lg:px-10 lg:py-12">
        <div className="container flex justify-center">
          <div className="w-full max-w-[380px] mt-6 lg:mt-32">
            <div
              className="flex justify-center mb-6 animate-fade-in-up"
              style={{ animationDelay: '0s' }}
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-800">
                {icon}
              </div>
            </div>

            <h2
              className="lg:text-h3 text-h5 font-semibold text-gray-900 text-center animate-fade-in-up"
              style={{ animationDelay: '0.1s' }}
            >
              {title}
            </h2>
            <p
              className="text-body-md text-gray-500 text-center leading-relaxed mb-6 animate-fade-in-up"
              style={{ animationDelay: '0.15s' }}
            >
              {subtitle}
            </p>

            {isExpired && (
              <div
                className="flex items-center gap-2 bg-orange-light text-orange text-body-sm rounded-lg px-3.5 py-3 mb-4 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <AlertTriangle size={15} />
                {t('login.expiredAlert')}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 animate-fade-in-up"
            >
              <div>
                <label htmlFor="login-email" className="block text-label-sm text-gray-700 mb-1.5">
                  {t('login.emailLabel')}
                </label>
                <input
                  id="login-email"
                  type="email"
                  placeholder={t('login.emailPlaceholder')}
                  disabled={isLocked}
                  {...register('email', {
                    required: t('login.errors.emailRequired'),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t('login.errors.emailInvalid'),
                    },
                    onChange: resetState,
                  })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-body-md text-gray-900 outline-none focus:border-gray-900 disabled:bg-gray-100 disabled:text-gray-500 transition-colors placeholder:text-gray-500"
                />
                {errors.email && (
                  <p className="text-red text-caption-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-label-sm text-gray-700 mb-1.5">
                  {t('login.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder={t('login.passwordPlaceholder')}
                    disabled={isLocked}
                    {...register('password', {
                      required: t('login.errors.passwordRequired'),
                      onChange: resetState,
                    })}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg text-body-md text-gray-900 outline-none focus:border-gray-900 disabled:bg-gray-100 disabled:text-gray-500 transition-colors placeholder:text-gray-500"
                  />
                  <button
                    type="button"
                    onClick={toggleLoginPassword}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  >
                    <EyeIcon open={showLoginPassword} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red text-caption-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || isLocked}
                className="w-full py-3 bg-gray-900 text-gray-50 rounded-lg text-label-md font-semibold hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLocked
                  ? t('login.tryAgain')
                  : isPending
                    ? t('login.signingIn')
                    : t('login.signIn')}
              </button>

              {isLocked && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Clock3 size={16} className="text-gray-700 animate-pulse" />
                  <p className="text-body-sm text-gray-700">
                    {t('login.nextAttempt')}{' '}
                    <span className="font-bold text-gray-900 tabular-nums">
                      {String(Math.floor(remainingTime / 60)).padStart(2, '0')}:
                      {String(remainingTime % 60).padStart(2, '0')}
                    </span>
                    <span className="text-gray-500"> {t('login.minutes')}</span>
                  </p>
                </div>
              )}

              {loginError && (
                <div className="bg-red-light border border-red rounded-lg px-3.5 py-2.5 text-red text-body-sm">
                  {loginError}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
