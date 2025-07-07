<template>
  <div>
    <div v-if="videos.length === 0" class="text-center py-12 text-gray-500">
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
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
      <p>{{ $t("noVideosYet") }}</p>
      <CoolButton @click="$emit('createNew')" color="primary" class="mt-4">
        {{ $t("createFirstVideo") }}
      </CoolButton>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(script, index) in videos"
        :key="index"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-lg mb-2">{{ script.title }}</h3>
            <p class="text-gray-600 mb-2">{{ script.description }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <span v-if="script.projectName" class="text-blue-600">
                {{ $t("projectSettings") }}: {{ script.projectName }}
              </span>
              <span>
                {{ $t("createdAt") }}: {{ formatDate(script.createdAt) }}
              </span>
              <span :class="getStatusClass(script.status)">
                {{ script.status ? $t(script.status) : $t("draft") }}
              </span>
            </div>
          </div>
          <div class="flex gap-2 ml-4">
            <CoolButton
              @click="$emit('detail', index)"
              color="secondary"
              :aria-label="$t('detail')"
              customClass="text-sm px-3 py-1"
              class="flex items-center gap-1"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span class="hidden sm:inline">{{ $t("detail") }}</span>
            </CoolButton>

            <CoolButton
              v-if="script.status === 'completed'"
              @click="$emit('preview', index)"
              color="primary"
              :aria-label="$t('preview')"
              customClass="text-sm px-3 py-1"
              class="flex items-center gap-1"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="hidden sm:inline">{{ $t("preview") }}</span>
            </CoolButton>

            <CoolButton
              @click="$emit('delete', index)"
              color="danger"
              :aria-label="$t('delete')"
              customClass="text-sm px-3 py-1"
              class="flex items-center gap-1"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span class="hidden sm:inline">{{ $t("delete") }}</span>
            </CoolButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";

const props = defineProps({
  videos: Array, // 実際は台本(scripts)のリストだが、親コンポーネントとの互換性のためvideosのまま維持
});

const emit = defineEmits(["delete", "preview", "createNew", "detail"]);

function formatDate(dateString) {
  if (!dateString) return "日時不明";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  if (!status) return "text-gray-600";
  switch (status) {
    case "generating":
      return "text-blue-600";
    case "completed":
      return "text-green-600";
    case "draft":
      return "text-gray-600";
    case "failed":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}
</script>
