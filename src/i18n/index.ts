import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
] as const;

const isBrowser = typeof window !== "undefined";

if (isBrowser) i18n.use(LanguageDetector);

i18n
  .use(initReactI18next)
  .init({
    // Fixed language on the server so SSR/prerender renders real strings
    // instead of raw keys like "sharedAnalysis.visit".
    lng: isBrowser ? undefined : "en",
    react: { useSuspense: false },
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es", "fr", "de", "it"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "sitescoper_lang",
    },
  });

export default i18n;