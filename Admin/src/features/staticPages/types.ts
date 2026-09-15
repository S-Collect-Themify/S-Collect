// ─── Shared ───────────────────────────────────────────────────────────────────
export type StaticPageTab = 'contact' | 'faq' | 'return' | 'terms' | 'privacy';

export type EditorLanguage = 'en' | 'ar';

/** Generic bilingual text pair used across every static page content field. */
export interface Bilingual {
  en: string;
  ar: string;
}

// ─── Contact Us ───────────────────────────────────────────────────────────────
export interface ContactSocialLinks {
  facebook: string;
  instagram: string;
  x: string;
  tiktok: string;
}

export interface ContactUsContent {
  email: string;
  phone: string;
  whatsapp: string;
  address: Bilingual;
  workingHours: Bilingual;
  socialLinks: ContactSocialLinks;
  mapUrl: string;
  updatedAt?: string;
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export interface FaqItem {
  id: string;
  question: Bilingual;
  answer: Bilingual;
  order: number;
}

export interface FaqCategory {
  id: string;
  name: Bilingual;
  order: number;
  items: FaqItem[];
}

// ─── Legal pages (Return Policy / Terms & Conditions / Privacy Policy) ────────
export type LegalPageType = 'return' | 'terms' | 'privacy';

export interface LegalPageContent {
  type: LegalPageType;
  title: Bilingual;
  body: Bilingual;
  updatedAt?: string;
}

// ─── Modal state ──────────────────────────────────────────────────────────────
export interface DeleteFaqItemModalState {
  open: boolean;
  categoryId: string | null;
  item: FaqItem | null;
}

export interface DeleteFaqCategoryModalState {
  open: boolean;
  category: FaqCategory | null;
}
