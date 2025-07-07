<template>
  <div class="flex h-screen">
    <!-- サイドメニュー -->
    <aside
      class="w-56 bg-gray-800 h-screen overflow-y-auto text-white flex flex-col px-4"
    >
      <div class="h-screen flex flex-col justify-between py-4">
        <div class="flex-1">
          <div class="text-2xl font-bold mb-8">{{ $t("appTitle") }}</div>
          <nav class="flex flex-col gap-2 flex-1">
            <router-link
              to="/"
              class="py-2 px-3 rounded hover:bg-gray-700"
              active-class="bg-gray-700 font-bold"
              >{{ $t("home") }}</router-link
            >
            <router-link
              to="/generate"
              class="py-2 px-3 rounded hover:bg-gray-700"
              active-class="bg-gray-700 font-bold"
              >{{ $t("generateMovie") }}</router-link
            >
            <router-link
              to="/project"
              class="py-2 px-3 rounded hover:bg-gray-700"
              active-class="bg-gray-700 font-bold"
              >{{ $t("projectSettings") }}</router-link
            >
            <router-link
              to="/settings"
              class="py-2 px-3 rounded hover:bg-gray-700"
              active-class="bg-gray-700 font-bold"
              >{{ $t("settings") }}</router-link
            >
          </nav>
        </div>
        <div class="pt-4">
          <select
            v-model="$i18n.locale"
            class="bg-gray-700 text-white rounded px-2 py-1"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </aside>
    <!-- メイン -->
    <main class="flex-1 bg-gray-50 h-screen overflow-y-auto p-6">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { onMounted, watch } from 'vue';

const { t } = useI18n();

// ページタイトルを設定
function updateTitle() {
  document.title = t('appTitle');
}

onMounted(() => {
  updateTitle();
});

// 言語が変更された時にタイトルも更新
watch(() => t('appTitle'), () => {
  updateTitle();
});
</script>
