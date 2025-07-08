import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import i18n from "./i18n";

// デバッグ用（開発環境のみ）
if (import.meta.env.DEV) {
  import("./utils/debugHelper.js").then(({ enableDebugConsole }) => {
    enableDebugConsole();
  });
}

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount("#app");
