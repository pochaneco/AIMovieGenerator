<template>
  <div class="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
    <h2 class="text-xl font-bold mb-4">{{ $t("settingsTitle") }}</h2>
    <form @submit.prevent="saveApiKey">
      <label class="block mb-2 font-medium">{{ $t("openaiApiKey") }}</label>
      <input
        v-model="apiKey"
        type="password"
        class="w-full border rounded px-3 py-2 mb-4"
        :placeholder="$t('openaiApiKey') + '...'"
      />

      <!-- 保存方式の選択 -->
      <div class="mb-4 p-3 bg-gray-50 rounded">
        <label class="block mb-2 font-medium text-sm">{{
          $t("saveMethod")
        }}</label>
        <div class="space-y-2">
          <label class="flex items-center cursor-pointer">
            <input
              v-model="saveMethod"
              type="radio"
              value="persistent"
              class="mr-2"
            />
            <span class="text-sm">
              {{ $t("saveToBrowser") }}
              <span class="text-gray-500 text-xs block">{{
                $t("saveToBrowserDesc")
              }}</span>
            </span>
          </label>
          <label class="flex items-center cursor-pointer">
            <input
              v-model="saveMethod"
              type="radio"
              value="session"
              class="mr-2"
            />
            <span class="text-sm">
              {{ $t("saveToSession") }}
              <span class="text-gray-500 text-xs block">{{
                $t("saveToSessionDesc")
              }}</span>
            </span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
      >
        {{ $t("save") }}
      </button>
    </form>
    <div v-if="saved" class="text-green-600 mt-2">{{ $t("saved") }}</div>

    <!-- 現在の保存状態表示 -->
    <div class="mt-4 p-2 bg-blue-50 rounded text-sm">
      <div class="font-medium text-blue-800">{{ $t("currentStatus") }}</div>
      <div class="flex items-center justify-between">
        <div class="text-blue-600">
          <span v-if="currentStorageType === 'persistent'">
            🔒 {{ $t("storedInBrowser") }}
          </span>
          <span v-else-if="currentStorageType === 'session'">
            ⏱️ {{ $t("storedInSession") }}
          </span>
          <span v-else> ❌ {{ $t("notStored") }} </span>
        </div>
        <!-- 削除ボタン -->
        <button
          v-if="currentStorageType !== 'none'"
          @click="clearApiKey"
          class="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors cursor-pointer"
          type="button"
        >
          {{ $t("deleteKey") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { getSetting, saveSetting } from "@/services/dataService.js";

const apiKey = ref("");
const saved = ref(false);
const saveMethod = ref("persistent"); // デフォルトはブラウザに保存

// セッションストレージ用のキー
const SESSION_KEY = "openai_api_key_session";

// 現在の保存状態を取得
const currentStorageType = computed(() => {
  const hasSessionStorage = sessionStorage.getItem(SESSION_KEY);
  const hasPersistentStorage = localStorage.getItem("openai_api_key");

  if (hasSessionStorage) return "session";
  if (hasPersistentStorage) return "persistent";
  return "none";
});

onMounted(async () => {
  await loadApiKey();
});

async function loadApiKey() {
  try {
    // まずセッションストレージをチェック
    const sessionKey = sessionStorage.getItem(SESSION_KEY);
    if (sessionKey) {
      apiKey.value = sessionKey;
      saveMethod.value = "session";
      return;
    }

    // 次に永続化ストレージをチェック
    const persistentKey = await getSetting("openai_api_key", "");
    if (persistentKey) {
      apiKey.value = persistentKey;
      saveMethod.value = "persistent";
      return;
    }

    // どちらもない場合はデフォルト
    saveMethod.value = "persistent";
  } catch (error) {
    console.error("設定の読み込みに失敗しました:", error);
  }
}

async function saveApiKey() {
  try {
    if (saveMethod.value === "session") {
      // セッションストレージに保存
      sessionStorage.setItem(SESSION_KEY, apiKey.value);
      // 永続化ストレージから削除（重複を避けるため）
      await clearPersistentApiKey();
    } else {
      // 永続化ストレージに保存
      await saveSetting("openai_api_key", apiKey.value);
      // セッションストレージから削除（重複を避けるため）
      sessionStorage.removeItem(SESSION_KEY);
    }

    saved.value = true;
    setTimeout(() => (saved.value = false), 1500);
  } catch (error) {
    console.error("設定の保存に失敗しました:", error);
    alert("設定の保存に失敗しました");
  }
}

async function clearPersistentApiKey() {
  try {
    await saveSetting("openai_api_key", "");
  } catch (error) {
    console.error("永続化設定のクリアに失敗しました:", error);
  }
}

async function clearApiKey() {
  try {
    if (currentStorageType.value === "persistent") {
      // 永続化ストレージをクリア
      await clearPersistentApiKey();
    } else if (currentStorageType.value === "session") {
      // セッションストレージをクリア
      sessionStorage.removeItem(SESSION_KEY);
    }

    // フォームをクリア
    apiKey.value = "";
    saveMethod.value = "persistent";

    // 成功メッセージ
    saved.value = true;
    setTimeout(() => (saved.value = false), 1500);
  } catch (error) {
    console.error("APIキーの削除に失敗しました:", error);
    alert("APIキーの削除に失敗しました");
  }
}
</script>
