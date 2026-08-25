import { useState, useEffect, forwardRef } from 'react';
import { type InputHTMLAttributes } from 'react';
import { FormProvider, useForm, useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthLeftPanel from '../../components/auth/AuthLeftPanel';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { useRegister } from '../../hooks/useRegister';
import { formatSaudiPhone, isValidSaudiPhone } from '../../features/settings/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  storeName: string;
  category: string;
  website: string;
  description: string;
  password: string;
  confirmPassword: string;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEP_KEYS = [
  'register.step1',
  'register.step2',
  'register.step3',
] as const;

const StepIndicator = ({ current }: { current: number }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center mb-8">
      {STEP_KEYS.map((key, i) => {
        const done = i < current;
        const active = i === current;

        return (
          <div
            key={i}
            className={`flex items-center ${i < STEP_KEYS.length - 1 ? 'flex-1' : ''}`}
          >
            <div className="flex flex-col items-center gap-1 w-[100px] shrink-0">
              {/* Circle */}
              <motion.div
                layout
                animate={{
                  scale: active ? [1, 1.15, 1] : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 450,
                  damping: 18,
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  done || active ? 'bg-green' : 'bg-gray-200'
                }`}
              >
                {done ? (
                  <motion.svg
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 18,
                    }}
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                ) : (
                  <span
                    className={`text-xs font-semibold ${active ? 'text-gray-50' : 'text-gray-400'}`}
                  >
                    {i + 1}
                  </span>
                )}
              </motion.div>
              {/* Label */}
              <motion.span
                animate={{
                  color: done ? '#22c55e' : active ? '#111827' : '#9ca3af',
                }}
                transition={{ duration: 0.25 }}
                className={`text-[10px] text-center leading-tight ${
                  active ? 'font-semibold' : ''
                }`}
              >
                {t(key)}
              </motion.span>
            </div>

            {/* Connector line */}
            {i < STEP_KEYS.length - 1 && (
              <div
                className="flex-1 flex items-center px-1"
                style={{ marginTop: '-1.1rem' }}
              >
                <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={false}
                    animate={{
                      width: done ? '100%' : '0%',
                    }}
                    transition={{
                      duration: 0.4,
                      ease: 'easeInOut',
                    }}
                    className="absolute left-0 top-0 h-full bg-green"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Shared Input ─────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...rest }, ref) => (
    <div>
      <label className="block text-label-sm text-gray-700 mb-1.5">
        {label}
        {rest.required && <span className="text-red ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 border rounded-lg text-body-md text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 ${
          error ? 'border-red bg-red-light' : 'border-gray-300 bg-gray-50'
        }`}
        {...rest}
      />
      {error && <p className="text-red text-caption-sm mt-1 animate-fade-in-up">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// ─── Eye Icon ─────────────────────────────────────────────────────────────────

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

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

const Step1 = () => {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RegisterFormData>();

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('register.firstNameLabel')}
          placeholder={t('register.firstNamePlaceholder')}
          required
          error={errors.firstName?.message}
          {...register('firstName', {
            required: t('register.errors.firstNameRequired'),
          })}
        />
        <Input
          label={t('register.lastNameLabel')}
          placeholder={t('register.lastNamePlaceholder')}
          required
          error={errors.lastName?.message}
          {...register('lastName', {
            required: t('register.errors.lastNameRequired'),
          })}
        />
      </div>
      <Input
        label={t('register.emailLabel')}
        placeholder={t('register.emailPlaceholder')}
        type="email"
        required
        error={errors.email?.message}
        {...register('email', {
          required: t('register.errors.emailRequired'),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t('register.errors.emailInvalid'),
          },
        })}
      />
      <div>
        <label className="block text-label-sm text-gray-700 mb-1.5">
          {t('register.phoneLabel')} <span className="text-red ml-0.5">*</span>
        </label>
        <Controller
          name="phone"
          control={control}
          rules={{
            required: t('register.errors.phoneRequired'),
            validate: (v) => {
              if (!v || !v.trim()) return t('register.errors.phoneRequired');
              return (
                isValidSaudiPhone(v) ||
                t('register.errors.phoneInvalid')
              );
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <>
              <div
                dir="ltr"
                className={`phone-input-custom h-[42px] rounded-lg px-3 flex items-center border transition-colors ${
                  error ? 'border-red bg-red-light phone-error' : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1.5 pe-2.5 me-2.5 border-e border-gray-200 shrink-0 select-none pointer-events-none">
                  <img
                    src="https://purecatamphetamine.github.io/country-flag-icons/3x2/SA.svg"
                    alt="Saudi Arabia"
                    className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm"
                  />
                  <span className="text-xs font-semibold text-gray-700 dir-ltr">+966</span>
                </div>
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="50 123 4567"
                  value={formatSaudiPhone(field.value).formatted}
                  onChange={(e) => {
                    const { full } = formatSaudiPhone(e.target.value);
                    field.onChange(full);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="PhoneInputInput"
                />
              </div>
              {error && (
                <p className="text-red text-caption-sm mt-1 animate-fade-in-up">{error.message}</p>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};

// ─── Step 2: Store Info ───────────────────────────────────────────────────────

const CATEGORY_KEYS = [
  'electronics',
  'fashion',
  'homeGarden',
  'sports',
  'books',
  'beauty',
  'food',
  'other',
] as const;

const Step2 = () => {
  const { t } = useTranslation();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterFormData>();
  const category = watch('category');

  return (
    <div className="flex flex-col gap-4">
      <Input
        label={t('register.storeNameLabel')}
        placeholder={t('register.storeNamePlaceholder')}
        required
        error={errors.storeName?.message}
        {...register('storeName', {
          required: t('register.errors.storeNameRequired'),
        })}
      />

      {/* Description textarea */}
      <div>
        <label className="block text-label-sm text-gray-700 mb-1.5">
          {t('register.descriptionLabel')}
          <span className="text-red ml-0.5">*</span>
        </label>
        <textarea
          placeholder={t('register.descriptionPlaceholder')}
          rows={1}
          className={`w-full px-3 py-2.5 border rounded-lg text-body-md text-gray-900 outline-none resize-vertical transition-colors placeholder:text-gray-400 focus:border-gray-900 font-sans ${
            errors.description
              ? 'border-red bg-red-light'
              : 'border-gray-300 bg-gray-50'
          }`}
          {...register('description', {
            required: t('register.errors.descriptionRequired'),
          })}
        />
        {errors.description && (
          <p className="text-red text-caption-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category select */}
      <div>
        <label className="block text-label-sm text-gray-700 mb-1.5">
          {t('register.categoryLabel')}
          <span className="text-red ml-0.5">*</span>
        </label>
        <select
          {...register('category', {
            required: t('register.errors.categoryRequired'),
          })}
          className={`w-full px-3 py-2.5 border rounded-lg text-body-md outline-none transition-colors cursor-pointer focus:border-gray-900 ${
            errors.category
              ? 'border-red bg-red-light text-gray-900'
              : 'border-gray-300 bg-gray-50'
          } ${!category ? 'text-gray-400' : 'text-gray-900'}`}
        >
          <option value="">{t('register.categoryPlaceholder')}</option>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {t(`register.categories.${key}`)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red text-caption-sm mt-1">
            {errors.category.message}
          </p>
        )}
      </div>

      <Input
        type="text"
        inputMode="numeric"
        label={t('register.websiteLabel')}
        placeholder={t('register.websitePlaceholder')}
        required
        maxLength={10}
        error={errors.website?.message}
        {...register('website', {
          required: t('register.errors.websiteRequired'),
          pattern: {
            value: /^\d{10}$/,
            message: t('register.errors.websiteInvalid'),
          },
        })}
      />
    </div>
  );
};

// ─── Password Strength ────────────────────────────────────────────────────────

const PasswordStrength = ({ password }: { password: string }) => {
  const { t } = useTranslation();

  const checks = [
    { label: t('register.passwordStrength.chars'), ok: password.length >= 8 },
    {
      label: t('register.passwordStrength.uppercase'),
      ok: /[A-Z]/.test(password),
    },
    {
      label: t('register.passwordStrength.number'),
      ok: /[0-9]/.test(password),
    },
    {
      label: t('register.passwordStrength.special'),
      ok: /[^a-zA-Z0-9]/.test(password),
    },
  ];

  const score = checks.filter((c) => c.ok).length;
  const barColors = [
    'bg-gray-200',
    'bg-red',
    'bg-yellow',
    'bg-gray-400',
    'bg-green',
  ];
  const strengthLabels = [
    '',
    t('register.passwordStrength.weak'),
    t('register.passwordStrength.fair'),
    t('register.passwordStrength.good'),
    t('register.passwordStrength.strong'),
  ];
  const strengthTextColors = [
    '',
    'text-red',
    'text-yellow',
    'text-gray-600',
    'text-green',
  ];

  if (!password) return null;

  return (
    <div className="mt-2">
      {/* Bar */}
      <div className="flex gap-1 mb-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-0.5 rounded-full transition-all ${i <= score ? barColors[score] : 'bg-gray-200'}`}
          />
        ))}
      </div>
      {/* Checks */}
      <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {checks.map(({ label, ok }) => (
            <span
              key={label}
              className={`text-caption-sm flex items-center gap-0.5 ${ok ? 'text-green' : 'text-gray-400'}`}
            >
              {ok ? '✓' : '○'} {label}
            </span>
          ))}
        </div>
        <span
          className={`text-caption-sm font-semibold ${strengthTextColors[score]}`}
        >
          {strengthLabels[score]}
        </span>
      </div>
    </div>
  );
};

// ─── Step 3: Set Password ─────────────────────────────────────────────────────

const Step3 = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState({ password: false, confirm: false });
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<RegisterFormData>();
  const password = watch('password');

  return (
    <div className="flex flex-col md:gap-5 gap-3">
      {/* Password */}
      <div>
        <label className="block text-label-sm text-gray-700 mb-1.5">
          {t('register.passwordLabel')}
          <span className="text-red ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            type={show.password ? 'text' : 'password'}
            placeholder={t('register.passwordPlaceholder')}
            className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-body-md text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 ${
              errors.password
                ? 'border-red bg-red-light'
                : 'border-gray-300 bg-gray-50'
            }`}
            {...register('password', {
              required: t('register.errors.passwordRequired'),
              minLength: {
                value: 8,
                message: t('register.errors.passwordMinLength'),
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, password: !s.password }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <EyeIcon open={show.password} />
          </button>
        </div>
        {errors.password && (
          <p className="text-red text-caption-sm mt-1">
            {errors.password.message}
          </p>
        )}
        <PasswordStrength password={password ?? ''} />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-label-sm text-gray-700 mb-1.5">
          {t('register.confirmPasswordLabel')}
          <span className="text-red ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            type={show.confirm ? 'text' : 'password'}
            placeholder={t('register.confirmPasswordPlaceholder')}
            className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-body-md text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-900 ${
              errors.confirmPassword
                ? 'border-red bg-red-light'
                : 'border-gray-300 bg-gray-50'
            }`}
            {...register('confirmPassword', {
              required: t('register.errors.confirmPasswordRequired'),
              validate: (val, formValues) =>
                val === formValues.password ||
                t('register.errors.passwordsMismatch'),
            })}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer "
          >
            <EyeIcon open={show.confirm} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red text-caption-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Email Sent Screen ────────────────────────────────────────────────────────

const ApplicationSubmitted = ({
  email,
  vendorId,
}: {
  email: string;
  vendorId?: string;
}) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const navigate = useNavigate();

  const handleCheckEmail = () => {
    window.open('https://mail.google.com', '_blank');
  };

  const displayVendorId = vendorId || 'NEX-2910-VM';

  return (
    <div className="text-center py-6 animate-fade-in-up flex flex-col items-center">
      {/* Circle Check Icon */}
      <div className="w-16 h-16 rounded-full bg-[#ecfdf3] border border-[#d3f9d8] inline-flex items-center justify-center mb-6 text-[#12b76a]">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-h6 lg:text-h5 font-bold text-gray-900 mb-2">
        {isRtl ? 'تم تقديم الطلب بنجاح' : 'Application Submitted Successfully'}
      </h2>

      {/* Subtitle */}
      <p className="text-label-sm font-semibold text-[#c28e2b] mb-6">
        {isRtl
          ? 'طلبك قيد المراجعة حالياً'
          : 'Your request is pending for review'}
      </p>

      {/* Description */}
      <p className="text-body-md text-gray-500 leading-relaxed mb-8 max-w-sm">
        {isRtl
          ? `لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني المسجل: ${email}. سيقوم فريقنا بمراجعة طلبك والرد عليك خلال 2-3 أيام عمل.`
          : `We've sent a confirmation email to your registered address: ${email}. Our team will review your application and get back to you within 2-3 business days.`}
      </p>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleCheckEmail}
          className="w-full py-3 bg-[#0c0c0d] hover:bg-[#1a1a1c] text-white rounded-lg text-label-md font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          {isRtl ? 'التحقق من البريد الإلكتروني' : 'Check Email'}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg text-label-md font-semibold transition-colors flex items-center justify-center cursor-pointer shadow-sm"
        >
          {isRtl ? 'العودة لتسجيل الدخول' : 'Back to login'}
        </button>
      </div>

      {/* Reference ID Footer */}
      <div className="w-full bg-[#f8f9fa] border border-gray-100 py-3 mt-8 rounded-lg text-body-sm text-gray-500 font-medium">
        {isRtl
          ? `الرقم المرجعي: ${displayVendorId}`
          : `Reference ID: ${displayVendorId}`}
      </div>
    </div>
  );
};

// ─── Register ─────────────────────────────────────────────────────────────────

const STEP_FIELDS: Record<number, (keyof RegisterFormData)[]> = {
  0: ['firstName', 'lastName', 'email', 'phone'],
  1: ['storeName', 'category', 'description', 'website'],
  2: ['password', 'confirmPassword'],
};

const Register = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const { step, setStep, nextStep, previousStep, resetRegister } = useAuthStore();

  const methods = useForm<RegisterFormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      storeName: '',
      category: '',
      website: '',
      description: '',
      password: '',
      confirmPassword: '',
    },
  });

  const {
    register: executeRegister,
    isPending,
    submitted,
    error,
    registrationData,
  } = useRegister(methods.setError);

  const registerError = error?.message;

  useEffect(() => {
    return () => {
      resetRegister();
    };
  }, [resetRegister]);

  // Automatically navigate to step containing active field errors
  useEffect(() => {
    const formErrors = methods.formState.errors;
    if (Object.keys(formErrors).length === 0) return;

    if (
      ['firstName', 'lastName', 'email', 'phone'].some(
        (f) => formErrors[f as keyof RegisterFormData]
      )
    ) {
      setStep(0);
      return;
    }

    if (
      ['storeName', 'category', 'description', 'website'].some(
        (f) => formErrors[f as keyof RegisterFormData]
      )
    ) {
      setStep(1);
      return;
    }
  }, [methods.formState.errors, setStep]);

  const handleContinue = async () => {
    const currentFields = STEP_FIELDS[step];
    const isValid = await methods.trigger(currentFields);

    if (!isValid) {
      const formErrors = methods.formState.errors;
      const FIELD_LABELS: Record<keyof RegisterFormData, { en: string; ar: string }> = {
        firstName: { en: 'First Name', ar: 'الاسم الأول' },
        lastName: { en: 'Last Name', ar: 'اسم العائلة' },
        email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
        phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
        storeName: { en: 'Store Name', ar: 'اسم المتجر' },
        category: { en: 'Category', ar: 'الفئة' },
        website: { en: 'Commercial Registration Number', ar: 'رقم السجل التجاري' },
        description: { en: 'Store Description', ar: 'وصف المتجر' },
        password: { en: 'Password', ar: 'كلمة المرور' },
        confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
      };

      const failedLabels = currentFields
        .filter((field) => formErrors[field])
        .map((field) => {
          const errObj = formErrors[field];
          const label = FIELD_LABELS[field]?.[isRtl ? 'ar' : 'en'] || field;
          return errObj?.message ? `${label} (${errObj.message})` : label;
        });

      if (failedLabels.length > 0) {
        const errorMsg = isRtl
          ? `يرجى تصحيح الحقول التالية:\n• ${failedLabels.join('\n• ')}`
          : `Please fix the following fields:\n• ${failedLabels.join('\n• ')}`;
        toast.error(errorMsg);
      }
      return;
    }

    if (step < 2) {
      nextStep();
      return;
    }

    methods.handleSubmit((values) => {
      executeRegister(values);
    })();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen font-sans">
      <AuthLeftPanel />

      <div className="flex-1 bg-gray-50 flex items-center justify-center px-4 md:px-10 py-12 overflow-y-auto flex justify-center items-start">
        <div className="w-full w-auto md:max-w-[480px] mt-6 lg:mt-48">
          {submitted ? (
            <ApplicationSubmitted
              email={methods.getValues('email')}
              vendorId={
                registrationData?.data?.vendorId || registrationData?.vendorId
              }
            />
          ) : (
            <>
              <div
                className="animate-fade-in-up"
                style={{ animationDelay: '0s' }}
              >
                <StepIndicator current={step} />
              </div>

              <FormProvider {...methods}>
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.1s' }}
                >
                  {step === 0 && <Step1 />}
                  {step === 1 && <Step2 />}
                  {step === 2 && <Step3 />}
                </div>
              </FormProvider>

              {registerError && (
                <div className="bg-red-light border border-red rounded-lg px-3.5 py-2.5 text-red text-body-sm mt-4 animate-fade-in-up whitespace-pre-line">
                  {registerError}
                </div>
              )}

              {/* Navigation buttons */}
              <div
                className="flex gap-3 mt-7 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                {step > 0 && (
                  <button
                    onClick={previousStep}
                    className="flex-1 py-3 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-label-md font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {t('register.back')}
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={isPending}
                  className="flex-[2] py-3 bg-gray-900 text-gray-50 rounded-lg text-label-md font-semibold hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isPending
                    ? t('register.creatingAccount')
                    : step === 2
                      ? t('register.createAccount')
                      : t('register.continue')}
                </button>
              </div>

              <p
                className="text-center mt-5 text-body-sm text-gray-500 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                {t('register.alreadyHaveAccount')}{' '}
                <Link
                  to="/login"
                  className="text-gray-900 font-semibold hover:underline"
                >
                  {t('register.logIn')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
