import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en_language_data } from "./en-language";
import { guj_language_data } from "./guj-language";
import { sp_language_data } from "./sp-language";
import { fr_language_data } from "./fr-language";
import { id_language_data } from "./id-language";
import { fil_language_data } from "./fil-language";
i18n.use(initReactI18next).init({
  lng: "en", // Default language
  fallbackLng: "en", // Fallback language
  resources: {
    en: {
      translation: en_language_data,
    },
    sp: {
      translation: sp_language_data,
    },
    fr: {
      translation: fr_language_data,
    },
    guj: {
      translation: guj_language_data,
    },
    id: {
      translation: id_language_data,
    },
    fil: {
      translation: fil_language_data,
    },
  },
});

export default i18n;
