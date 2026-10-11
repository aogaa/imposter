import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en';
import no from './locales/no';

export const SUPPORTED_LANGUAGES = ['no', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

/** Maps the device locale to a supported language. Norwegian (nb/nn/no) is the default. */
export function detectLanguage(): Language {
  const code = getLocales()[0]?.languageCode ?? 'no';
  if (code === 'en') return 'en';
  return 'no';
}

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources: { no: { translation: no }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: 'no',
  interpolation: { escapeValue: false },
});

export default i18n;
