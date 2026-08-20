import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { cn, getPasswordStrength } from './utils';

export function SectionCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white/50 border border-gray-200 rounded-lg overflow-visible transition-all duration-300 ease-out ">
      {children}
    </div>
  );
}

const inputBase =
  'w-full py-2.5 md:py-3 px-3 text-sm text-[#090909] bg-white/50 border border-[#E9E9E9] rounded-lg font-normal ' +
  'outline-none transition-all duration-200 ease-out placeholder:text-gray-400 ' +
  'focus:border-[#090909] focus:ring-1 focus:ring-gray-200 focus:-translate-y-0.5 ' +
  'disabled:bg-white/50 disabled:text-[#090909] disabled:cursor-default';

const inputErrorCls =
  'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-100';

export function TextInput({
  error,
  className,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  ref?: Ref<HTMLInputElement>;
}) {
  return (
    <input
      ref={ref}
      className={cn(inputBase, error ? inputErrorCls : '', className)}
      {...props}
    />
  );
}

export function TextAreaInput({
  error,
  className,
  ref,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2 text-sm text-gray-900 bg-white/50 border border-gray-200 rounded-md ' +
          'outline-none transition-all duration-200 ease-out placeholder:text-gray-400 resize-none ' +
          'focus:border-gray-400 focus:ring-1 focus:ring-gray-200 focus:-translate-y-0.5',
        error ? inputErrorCls : '',
        className
      )}
      {...props}
    />
  );
}

export function FieldWrap({
  label,
  required,
  error,
  helperText,
  helperRight,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  helperRight?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#090909] mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {children}
      {error ? (
        <p className="settings-pop-enter mt-1 text-[12px] text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <div className="flex justify-between mt-1">
          <p className="text-xs text-gray-400">{helperText}</p>
          {helperRight && (
            <p className="text-xs text-gray-400">{helperRight}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  label,
  value,
  error,
  helperText,
  onChange,
  autoComplete = 'off',
}: {
  label: string;
  value: string;
  error?: string;
  helperText?: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  return (
    <FieldWrap
      label={label}
      error={error}
      helperText={error ? undefined : helperText}
    >
      <div className="relative">
        <TextInput
          type={show ? 'text' : 'password'}
          value={value}
          error={error}
          autoComplete={autoComplete}
          className="pr-10"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={
            show
              ? t('settings.account.hidePassword')
              : t('settings.account.showPassword')
          }
          className={cn(
            'absolute inset-y-0 right-3 flex items-center transition-all duration-200 hover:scale-110 hover:text-gray-600',
            show ? 'text-gray-700' : 'text-gray-400'
          )}
          onClick={() => setShow((v) => !v)}
        >
          {show ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
      </div>
    </FieldWrap>
  );
}

export function PasswordStrengthBar({
  password,
  error,
}: {
  password: string;
  error?: string;
}) {
  const { t } = useTranslation();
  const strength = getPasswordStrength(password);
  const isGood = strength >= 4;
  const isWeak = strength >= 2 && strength < 4;

  if (!password) return null;

  const barColor = isGood ? 'bg-green-500' : 'bg-red-500';
  const barWidth = isGood ? '100%' : `${Math.min(strength * 20, 60)}%`;
  const label = isGood
    ? t('settings.account.passwordGood')
    : isWeak
      ? t('settings.account.passwordWeak')
      : '';
  const labelColor = isGood ? 'text-green-600' : 'text-red-500';

  return (
    <div className="mt-2">
      <div className="h-0.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            barColor
          )}
          style={{ width: barWidth }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <p
          className={cn(
            'text-xs',
            error ? 'text-red-500' : 'text-gray-400'
          )}
        >
          {t('settings.account.passwordRequirement')}
        </p>
        {label && (
          <p
            className={cn('text-xs font-medium ml-2 shrink-0', labelColor)}
          >
            {label}
          </p>
        )}
      </div>
    </div>
  );
}


export function SuccessToast({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
  duration?: number;
}) {
  useEffect(() => {
    toast.success(message);
    if (onClose) onClose();
  }, [message, onClose]);

  return null;
}
