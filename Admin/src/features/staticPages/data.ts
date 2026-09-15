import type { ContactUsContent, FaqCategory, LegalPageContent } from './types';

// ─── Default / fallback content ────────────────────────────────────────────────
// Used until the backend API for static pages is available, and as the initial
// state so the editor always has something sensible to render.

export const EMPTY_CONTACT_US: ContactUsContent = {
  email: '',
  phone: '',
  whatsapp: '',
  address: { en: '', ar: '' },
  workingHours: { en: '', ar: '' },
  socialLinks: {
    facebook: '',
    instagram: '',
    x: '',
    tiktok: '',
  },
  mapUrl: '',
};

export const INITIAL_FAQ_CATEGORIES: FaqCategory[] = [];

export const EMPTY_LEGAL_PAGE = (type: LegalPageContent['type']): LegalPageContent => ({
  type,
  title: { en: '', ar: '' },
  body: { en: '', ar: '' },
});
