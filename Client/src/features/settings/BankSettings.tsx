import {
  useForm,
  type UseFormRegisterReturn,
  type FieldError,
} from 'react-hook-form';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { mapServiceErrorsToForm } from './utils';

export interface BankAccountFormValues {
  bankName: string;
  iban: string;
  accountHolderName: string;
}

export interface BankAccountFormProps {
  defaultValues?: Partial<BankAccountFormValues>;
  onSave?: (values: BankAccountFormValues) => Promise<void> | void;
  isPending?: boolean;
}

const EMPTY_VALUES: BankAccountFormValues = {
  bankName: '',
  iban: '',
  accountHolderName: '',
};

const IBAN_MAX_LENGTH = 24;

type InputFieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  maxLength?: number;
  disabled?: boolean;
};

function InputField({
  id,
  label,
  placeholder,
  hint,
  error,
  registration,
  maxLength,
  disabled,
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-gray-900">
        {label}
      </label>

      <input
        id={id}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        {...registration}
        className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none ${error
            ? 'border-red-400 text-red-600 focus:border-red-400'
            : 'border-gray-200 focus:border-gray-400'
          } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
      />

      <p
        className={`mt-1.5 text-xs ${error ? 'text-red-500' : 'text-gray-400'}`}
      >
        {error?.message || hint}
      </p>
    </div>
  );
}

export default function BankAccountForm({
  defaultValues,
  onSave,
  isPending = false,
}: BankAccountFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<BankAccountFormValues>({
    values: {
      ...EMPTY_VALUES,
      ...defaultValues,
    },
    mode: 'onBlur',
  });

  const ibanValue = watch('iban') ?? '';

  const onSubmit = async (data: BankAccountFormValues) => {
    try {
      if (onSave) {
        await onSave(data);
      }
    } catch (err) {
      console.error('Submission error in BankAccountForm:', err);
      mapServiceErrorsToForm(err, setError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">
        {t('settings.bank.title')}
      </h2>

      <p className="mt-1.5 text-sm text-gray-500">
        {t('settings.bank.description')}
      </p>

      <div className="mt-3 md:mt-4 flex gap-3 rounded-xl bg-indigo-50 p-4">
        <Info size={18} className="mt-0.5 shrink-0 text-indigo-500" />

        <p className="text-sm leading-relaxed text-indigo-700">
          {t('settings.bank.securityInfo')}
        </p>
      </div>

      <div className="mt-3 md:mt-5">
        <InputField
          id="bankName"
          label={t('settings.bank.bankName')}
          placeholder={t('settings.bank.bankNamePlaceholder')}
          hint={t('settings.bank.bankNameHint')}
          disabled={isPending}
          registration={register('bankName')}
        />
      </div>

      <div className="mt-3 md:mt-5">
        <label htmlFor="iban" className="text-sm font-semibold text-gray-900">
          {t('settings.bank.iban')} <span className="text-red-500">*</span>
        </label>

        <input
          id="iban"
          placeholder={t('settings.bank.ibanPlaceholder')}
          maxLength={IBAN_MAX_LENGTH}
          disabled={isPending}
          {...register('iban', {
            required: t('settings.bank.ibanRequired'),
            validate: (value) => {
              if (value.includes('*')) {
                return (
                  t('settings.bank.ibanFullRequired') ||
                  'Please enter full IBAN starting with SA'
                );
              }
              return /^SA\d{22}$/.test(value) || t('settings.bank.ibanInvalid');
            },
            setValueAs: (value: string) => value?.toUpperCase() || '',
          })}
          className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none ${errors.iban
              ? 'border-red-400 text-red-600 focus:border-red-400'
              : 'border-gray-200 focus:border-gray-400'
            } disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
        />

        <div className="mt-1.5 flex items-center justify-between">
          <p
            className={`text-xs ${errors.iban ? 'text-red-500' : 'text-gray-400'
              }`}
          >
            {errors.iban?.message || ' '}
          </p>

          <span className="text-xs text-gray-400">
            {ibanValue.length} / {IBAN_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mt-3 md:mt-5">
        <InputField
          id="accountHolderName"
          label={t('settings.bank.accountHolderName')}
          placeholder={t('settings.bank.accountHolderPlaceholder')}
          hint={t('settings.bank.accountHolderHint')}
          disabled={isPending}
          registration={register('accountHolderName')}
        />
      </div>

      <div className="mt-4 md:mt-8 flex justify-center md:justify-end gap-3">
        <button
          type="button"
          onClick={() => reset()}
          disabled={!isDirty || isPending}
          className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {t('settings.bank.resetChanges')}
        </button>

        <button
          type="submit"
          disabled={!isDirty || !isValid || isPending}
          className={`rounded-xl px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-semibold transition-colors cursor-pointer ${isDirty && isValid && !isPending
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
        >
          {isPending ? t('settings.saving') : t('settings.bank.save')}
        </button>
      </div>
    </form>
  );
}
