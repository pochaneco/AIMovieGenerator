<template>
  <div>
    <div v-if="videos.length === 0" class="text-center py-12 text-gray-500">
      <Icon name="video" size="2xl" class="mx-auto text-gray-400 mb-4" />
      <p>{{ $t("noVideosYet") }}</p>
      <CoolButton @click="$emit('createNew')" variant="primary" class="mt-4">
        {{ $t("createFirstVideo") }}
      </CoolButton>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="(script, index) in videos"
        :key="index"
        class="border rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <!-- タイトル行とボタン -->
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold text-lg">{{ script.title }}</h3>
          <div class="flex gap-2">
            <CoolButton
              @click="$emit('detail', index)"
              variant="secondary"
              :aria-label="$t('detail')"
              customClass="text-sm px-3 py-1"
              class="flex items-center gap-1"
            >
              <Icon name="eye" size="sm" />
              <span class="hidden sm:inline">{{ $t("detail") }}</span>
            </CoolButton>

            <CoolButton
              @click="$emit('delete', index)"
              variant="danger"
              :aria-label="$t('delete')"
              customClass="text-sm px-3 py-1"
              class="flex items-center gap-1"
            >
              <Icon name="trash" size="sm" />
              <span class="hidden sm:inline">{{ $t("delete") }}</span>
            </CoolButton>
          </div>
        </div>

        <!-- 説明と詳細情報 -->
        <div>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";

const props = defineProps({
  videos: Array, // 実際は台本(scripts)のリストだが、親コンポーネントとの互換性のためvideosのまま維持
});

const emit = defineEmits(["delete", "createNew", "detail"]);

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
