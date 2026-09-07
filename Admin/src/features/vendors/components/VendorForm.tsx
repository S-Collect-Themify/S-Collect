import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  EMPTY_VENDOR_FORM,
  type VendorFormValues,
} from '../utils/vendorFormUtils';

interface VendorFormProps {
  mode: 'create' | 'edit';
  initialValues?: VendorFormValues;
  submitting?: boolean;
  onSubmit: (values: VendorFormValues) => void;
  onCancel: () => void;
}

export default function VendorForm({
  mode,
  initialValues,
  submitting,
  onSubmit,
  onCancel,
}: VendorFormProps) {
  const { t } = useTranslation();
  const isCreate = mode === 'create';

  const [form, setForm] = useState<VendorFormValues>(
    initialValues ?? EMPTY_VENDOR_FORM
  );

  // Re-sync when initial values change (edit page finishes loading the vendor).
  const [syncedFrom, setSyncedFrom] = useState(initialValues);
  if (initialValues && initialValues !== syncedFrom) {
    setSyncedFrom(initialValues);
    setForm(initialValues);
  }

  const setField =
    (key: keyof VendorFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
      {/* Dummy hidden fields to stop browsers autofilling email/password. */}
      <input type="text" name="username" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
      <input type="password" name="password" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden="true" />
      {/* Basic Information */}
      <Section title={t('vendors.edit.basicInfo', 'Basic Information')}>
        <Field
          label={t('vendors.edit.firstName', 'First Name')}
          value={form.firstName}
          onChange={setField('firstName')}
          required
        />
        <Field
          label={t('vendors.edit.lastName', 'Last Name')}
          value={form.lastName}
          onChange={setField('lastName')}
          required
        />
      </Section>

      {/* Account / Contact Information */}
      <Section title={t('vendors.edit.contactInfo', 'Contact Information')}>
        <Field
          label={t('vendors.edit.email', 'Email')}
          type="email"
          value={form.email}
          onChange={setField('email')}
          required
          autoComplete="off"
        />
        {isCreate && (
          <Field
            label={t('vendors.edit.password', 'Password')}
            type="password"
            value={form.password}
            onChange={setField('password')}
            required
            autoComplete="new-password"
          />
        )}
        <Field
          label={t('vendors.edit.phoneNumber', 'Phone Number')}
          value={form.phoneNumber}
          onChange={setField('phoneNumber')}
        />
        <Field
          label={t('vendors.edit.publicEmail', 'Public Email')}
          type="email"
          value={form.publicEmail}
          onChange={setField('publicEmail')}
        />
        <Field
          label={t('vendors.edit.publicPhoneNumber', 'Public Phone Number')}
          value={form.publicPhoneNumber}
          onChange={setField('publicPhoneNumber')}
        />
      </Section>

      {/* Store Information */}
      <Section title={t('vendors.edit.storeInfo', 'Store Information')}>
        <Field
          label={t('vendors.edit.storeName', 'Store Name')}
          value={form.storeName}
          onChange={setField('storeName')}
          required
        />
        <Field
          label={t('vendors.edit.storeNameAr', 'Store Name (Arabic)')}
          value={form.storeNameAr}
          onChange={setField('storeNameAr')}
          dir="rtl"
        />
        <Field
          label={t(
            'vendors.edit.commercialRegisterNumber',
            'Commercial Register Number'
          )}
          value={form.commercialRegisterNumber}
          onChange={setField('commercialRegisterNumber')}
        />
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">
            {t('vendors.edit.storeDescription', 'Store Description')}
          </label>
          <textarea
            value={form.storeDescription}
            onChange={setField('storeDescription')}
            rows={4}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-y"
          />
        </div>
      </Section>

      {/* Inventory & Shipping */}
      <Section title={t('vendors.edit.inventoryShipping', 'Inventory & Shipping')}>
        <Field
          label={t('vendors.edit.lowStockThreshold', 'Low Stock Threshold')}
          type="number"
          value={form.lowStockThreshold}
          onChange={setField('lowStockThreshold')}
        />
        <Field
          label={t('vendors.edit.flatShippingRate', 'Flat Shipping Rate')}
          type="number"
          value={form.flatShippingRate}
          onChange={setField('flatShippingRate')}
        />
      </Section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting && <Loader2 size={15} className="animate-spin" />}
          {isCreate
            ? t('vendors.add.submit', 'Create Vendor')
            : t('vendors.edit.save', 'Save Changes')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {t('vendors.edit.cancel', 'Cancel')}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">
      <h2 className="text-sm font-bold text-gray-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  dir,
  required,
  autoComplete = 'off',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  dir?: 'rtl' | 'ltr';
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        dir={dir}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
      />
    </div>
  );
}
