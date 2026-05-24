import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import hi from './hi.json'
import en from './en.json'
import pa from './pa.json'
import mr from './mr.json'

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'hi',
  fallbackLng: 'en',
  resources: {
    hi: { translation: hi },
    en: { translation: en },
    pa: { translation: pa },
    mr: { translation: mr },
  },
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
})

export default i18n
