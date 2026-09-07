import type {
  CreateBuyerPayload,
  UpdateBuyerPayload,
} from '../../../services/buyers';

export interface BuyerFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export const EMPTY_BUYER_FORM: BuyerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
};

function toStr(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

/** Maps a raw backend buyer object into editable form values. */
export function rawToBuyerForm(raw: unknown): BuyerFormValues {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    ...EMPTY_BUYER_FORM,
    firstName: toStr(r.firstName),
    lastName: toStr(r.lastName),
    email: toStr(r.email),
    phoneNumber: toStr(r.phoneNumber ?? r.phone),
  };
}

/** Builds the API payload from form values. Includes `password` only in create mode. */
export function buildBuyerPayload(
  values: BuyerFormValues,
  opts: { includePassword: true }
): CreateBuyerPayload;
export function buildBuyerPayload(
  values: BuyerFormValues,
  opts?: { includePassword?: false }
): UpdateBuyerPayload;
export function buildBuyerPayload(
  values: BuyerFormValues,
  opts?: { includePassword?: boolean }
): CreateBuyerPayload | UpdateBuyerPayload {
  const payload: Record<string, unknown> = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
  };

  const phone = values.phoneNumber.trim();
  if (phone !== '') payload.phoneNumber = phone;

  if (opts?.includePassword) {
    payload.password = values.password;
    return payload as unknown as CreateBuyerPayload;
  }
  return payload as unknown as UpdateBuyerPayload;
}
