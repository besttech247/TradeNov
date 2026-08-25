import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    ar: {
      translation: {
        welcome: "مرحباً بك في تريدنوف",
        dashboard: "لوحة القيادة",
      }
    },
    en: {
      translation: {
        welcome: "Welcome to TradeNov",
        dashboard: "Dashboard",
      }
    }
  },
  lng: "ar", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
