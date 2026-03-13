import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
  lng: 'es',
  fallbackLng: 'en',
  resources: {
    es: {
      translation: {
        home: {
          title: 'Starter profesional listo para escalar',
          subtitle: 'Base modular React + Express + MongoDB con TypeScript estricto.',
          switchLanguage: 'Cambiar idioma'
        }
      }
    },
    en: {
      translation: {
        home: {
          title: 'Professional starter ready to scale',
          subtitle: 'Modular React + Express + MongoDB baseline with strict TypeScript.',
          switchLanguage: 'Switch language'
        }
      }
    }
  },
  interpolation: {
    escapeValue: false
  }
});
