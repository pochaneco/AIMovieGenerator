<template>
  <BaseLayout>
    <div class="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 class="text-2xl font-bold mb-4">動画生成</h2>
      <p class="mb-6 text-gray-600">
        AIを使って動画を生成します。タイトルと説明を入力してください。
      </p>
      <form @submit.prevent="onGenerate">
        <div class="mb-4">
          <label class="block mb-1 font-medium">動画タイトル</label>
          <input
            v-model="title"
            type="text"
            class="w-full border rounded px-3 py-2"
            placeholder="例: 未来の都市"
          />
        </div>
        <div class="mb-6">
          <label class="block mb-1 font-medium">説明</label>
          <textarea
            v-model="description"
            class="w-full border rounded px-3 py-2"
            rows="3"
            placeholder="どんな動画にしたいか説明してください"
          ></textarea>
        </div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          生成
        </button>
      </form>
      <div v-if="loading" class="mt-4 text-blue-600">生成中...</div>
      <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
      <!-- 生成結果やプレビューは今後ここに追加 -->
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref } from "vue";
import BaseLayout from "../../Layouts/BaseLayout.vue";
const title = ref("");
const description = ref("");
const loading = ref(false);
const error = ref("");

function onGenerate() {
  error.value = "";
  if (!title.value || !description.value) {
    error.value = "タイトルと説明を入力してください。";
    return;
  }
  loading.value = true;
  // ここでAPI連携や生成処理を今後追加
  setTimeout(() => {
    loading.value = false;
    // 生成結果の表示処理を今後追加
  }, 1500);
}
</script>
