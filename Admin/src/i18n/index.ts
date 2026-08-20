import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from '../locales/ar/translation.json';
import en from '../locales/en/translation.json';

const savedLang = localStorage.getItem('lang') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: ar,
    },
    en: {
      translation: en,
    },
  },

  lng: savedLang,

  fallbackLng: 'en',

  interpolation: {
    escapeValue: false,
  },
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
}

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  }
});

export default i18n;
