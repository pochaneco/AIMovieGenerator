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
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {{ $t("save") }}
      </button>
    </form>
    <div v-if="saved" class="text-green-600 mt-2">{{ $t("saved") }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const apiKey = ref("");
const saved = ref(false);

onMounted(() => {
  apiKey.value = localStorage.getItem("openai_api_key") || "";
});

function saveApiKey() {
  localStorage.setItem("openai_api_key", apiKey.value);
  saved.value = true;
  setTimeout(() => (saved.value = false), 1500);
}
</script>
