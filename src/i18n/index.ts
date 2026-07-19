import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/translation.json";
import es from "./locales/es/translation.json";

/**
 * i18n setup — English (default) + Spanish. The language is detected from and
 * cached to localStorage so the choice survives reloads (local-only app, no
 * backend). Import this module for its side effect before rendering.
 */
void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "highcount:lang",
    },
  });

/** Keep the document language in sync for accessibility. */
function syncHtmlLang(lng: string) {
  document.documentElement.lang = lng;
}
syncHtmlLang(i18n.resolvedLanguage ?? "en");
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
