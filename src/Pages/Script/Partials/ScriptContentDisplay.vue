<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h2 class="text-xl font-semibold">{{ $t("scriptContent") }}</h2>
    </div>

    <div class="p-6">
      <div v-if="scriptContent && scriptContent.length > 0" class="space-y-4">
        <div
          v-for="item in scriptContent"
          :key="item.id"
          class="p-4 rounded-lg border"
          :class="getItemClass(item.type)"
        >
          <!-- シーンタイトル -->
          <div v-if="item.type === 'scene'" class="scene-item">
            <h3 class="font-bold text-lg text-blue-800 mb-2">
              {{ item.title }}
            </h3>
            <p class="text-gray-700">{{ item.content }}</p>
          </div>

          <!-- セリフ -->
          <div v-else-if="item.type === 'dialogue'" class="dialogue-item">
            <div class="flex items-start gap-3">
              <span
                class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded"
              >
                {{ item.character }}
              </span>
              <p class="text-gray-800 flex-1">{{ item.content }}</p>
            </div>
          </div>

          <!-- ナレーション -->
          <div v-else-if="item.type === 'narration'" class="narration-item">
            <div class="flex items-start gap-3">
              <span
                class="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded"
              >
                {{ $t("narration") }}
              </span>
              <p class="text-gray-700 italic flex-1">{{ item.content }}</p>
            </div>
          </div>

          <!-- その他のタイプ -->
          <div v-else class="other-item">
            <p class="text-gray-600">{{ item.content }}</p>
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else class="text-center py-12 text-gray-500">
        <svg
          class="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="mb-4">{{ $t("noScriptContent") }}</p>
        <p class="text-sm">{{ $t("generateScriptToSeeContent") }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  scriptContent: {
    type: Array,
    default: () => [],
  },
});

function getItemClass(type) {
  switch (type) {
    case "scene":
      return "bg-blue-50 border-blue-200";
    case "dialogue":
      return "bg-green-50 border-green-200";
    case "narration":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
}
</script>
