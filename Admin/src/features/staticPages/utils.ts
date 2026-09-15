import type { Bilingual } from './types';

/** Generates a locally-unique id for freshly created FAQ categories/items before the API assigns a real one. */
export const generateLocalId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

/** True when neither language variant of a bilingual field has content. */
export const isBilingualEmpty = (value?: Bilingual | null): boolean =>
  !value || (!value.en.trim() && !value.ar.trim());

export const emptyBilingual = (): Bilingual => ({ en: '', ar: '' });
