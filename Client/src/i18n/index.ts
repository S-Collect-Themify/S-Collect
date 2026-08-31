import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar/translation.json';
import en from '../locales/en/translation.json';

const initialLang = localStorage.getItem('lang') || 'en';

if (typeof document !== 'undefined') {
  document.documentElement.dir = initialLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = initialLang;
}

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: ar,
    },
    en: {
      translation: en,
    },
  },

  lng: initialLang,

  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    localStorage.setItem('lang', lng);
  }
});

export default i18n;