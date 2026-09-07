import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EMPTY_BUYER_FORM, type BuyerFormValues } from '../utils/buyerFormUtils';

interface BuyerFormProps {
  mode: 'create' | 'edit';
  initialValues?: BuyerFormValues;
  submitting?: boolean;
  onSubmit: (values: BuyerFormValues) => void;
  onCancel: () => void;
}

export default function BuyerForm({
  mode,
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: BuyerFormProps) {
  const { t } = useTranslation();
  const isCreate = mode === 'create';

  const [form, setForm] = useState<BuyerFormValues>(
    initialValues ?? EMPTY_BUYER_FORM
  );

  // Re-sync when initial values change (edit page finishes loading the buyer).
  const [syncedFrom, setSyncedFrom] = useState(initialValues);
  if (initialValues && initialValues !== syncedFrom) {
    setSyncedFrom(initialValues);
    setForm(initialValues);
  }

  const setField =
    (key: keyof BuyerFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl space-y-6"
      autoComplete="off"
    >
      {/* Decoy fields to stop browsers autofilling email/password. */}
      <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
      <input type="password" name="password" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden="true" />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">
          {t('buyers.edit.basicInfo', 'Basic Information')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t('buyers.edit.firstName', 'First Name')}
            value={form.firstName}
            onChange={setField('firstName')}
            required
          />
          <Field
            label={t('buyers.edit.lastName', 'Last Name')}
            value={form.lastName}
            onChange={setField('lastName')}
            required
          />
          <Field
            label={t('buyers.edit.email', 'Email')}
            type="email"
            value={form.email}
            onChange={setField('email')}
            required
            autoComplete="off"
          />
          <Field
            label={t('buyers.edit.phoneNumber', 'Phone Number')}
            value={form.phoneNumber}
            onChange={setField('phoneNumber')}
          />
          {isCreate && (
            <Field
              label={t('buyers.edit.password', 'Password')}
              type="password"
              value={form.password}
              onChange={setField('password')}
              required
              autoComplete="new-password"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {isCreate
            ? t('buyers.add.submit', 'Create Buyer')
            : t('buyers.edit.save', 'Save Changes')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t('buyers.edit.cancel', 'Cancel')}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  autoComplete = 'off',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const { t } = useTranslation();
  const isPassword = type === 'password';
  const [revealed, setRevealed] = useState(false);
  const inputType = isPassword && revealed ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 ${
            isPassword ? 'pe-10' : ''
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            title={
              revealed
                ? t('buyers.edit.hidePassword', 'Hide password')
                : t('buyers.edit.showPassword', 'Show password')
            }
            aria-label={
              revealed
                ? t('buyers.edit.hidePassword', 'Hide password')
                : t('buyers.edit.showPassword', 'Show password')
            }
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}
