import { createI18n } from "vue-i18n";
import ja from "./locales/ja";
import en from "./locales/en";

const messages = { ja, en };

const i18n = createI18n({
  legacy: false,
  locale: "ja",
  fallbackLocale: "en",
  messages,
});

export default i18n;
