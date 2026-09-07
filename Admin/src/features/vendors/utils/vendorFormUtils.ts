import type {
  CreateVendorPayload,
  UpdateVendorPayload,
} from '../../../services/vendors';

export interface VendorFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  storeName: string;
  storeNameAr: string;
  storeDescription: string;
  publicEmail: string;
  publicPhoneNumber: string;
  commercialRegisterNumber: string;
  lowStockThreshold: string;
  flatShippingRate: string;
}

export const EMPTY_VENDOR_FORM: VendorFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phoneNumber: '',
  storeName: '',
  storeNameAr: '',
  storeDescription: '',
  publicEmail: '',
  publicPhoneNumber: '',
  commercialRegisterNumber: '',
  lowStockThreshold: '',
  flatShippingRate: '',
};

/** Coerces a value that may arrive as a localized object into a plain string. */
export function toStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate = obj.value ?? obj.en ?? obj.ar ?? obj.email ?? obj.text;
    if (typeof candidate === 'string') return candidate;
  }
  return '';
}

/** Maps a raw backend vendor object into editable form values. */
export function rawToVendorForm(raw: unknown): VendorFormValues {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    ...EMPTY_VENDOR_FORM,
    firstName: toStr(r.firstName),
    lastName: toStr(r.lastName),
    email: toStr(r.email),
    phoneNumber: toStr(r.phoneNumber),
    storeName: toStr(r.storeName),
    storeNameAr: toStr(r.storeNameAr),
    storeDescription: toStr(r.storeDescription),
    publicEmail: toStr(r.publicEmail),
    publicPhoneNumber: toStr(r.publicPhoneNumber),
    commercialRegisterNumber: toStr(r.commercialRegisterNumber),
    lowStockThreshold: toStr(r.lowStockThreshold),
    flatShippingRate: toStr(r.flatShippingRate),
  };
}

/** Builds the API payload from form values. Includes `password` only in create mode. */
export function buildVendorPayload(
  values: VendorFormValues,
  opts: { includePassword: true }
): CreateVendorPayload;
export function buildVendorPayload(
  values: VendorFormValues,
  opts?: { includePassword?: false }
): UpdateVendorPayload;
export function buildVendorPayload(
  values: VendorFormValues,
  opts?: { includePassword?: boolean }
): CreateVendorPayload | UpdateVendorPayload {
  // Required fields — always sent (the form enforces they are non-empty).
  const payload: Record<string, unknown> = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    storeName: values.storeName.trim(),
  };

  // Optional string fields — only sent when filled, so the backend does not
  // reject empty strings that fail format validation (e.g. email/phone).
  const optionalStrings: Array<keyof VendorFormValues> = [
    'phoneNumber',
    'storeNameAr',
    'storeDescription',
    'publicEmail',
    'publicPhoneNumber',
    'commercialRegisterNumber',
  ];
  for (const key of optionalStrings) {
    const val = values[key].trim();
    if (val !== '') payload[key] = val;
  }

  const lowStock = Number(values.lowStockThreshold);
  if (values.lowStockThreshold.trim() !== '' && !Number.isNaN(lowStock)) {
    payload.lowStockThreshold = lowStock;
  }
  const flatRate = Number(values.flatShippingRate);
  if (values.flatShippingRate.trim() !== '' && !Number.isNaN(flatRate)) {
    payload.flatShippingRate = flatRate;
  }

  if (opts?.includePassword) {
    payload.password = values.password;
    return payload as unknown as CreateVendorPayload;
  }
  return payload as unknown as UpdateVendorPayload;
}
