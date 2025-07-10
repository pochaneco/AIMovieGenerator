<template>
  <EntityList
    :items="videos"
    :actions="scriptActions"
    :empty-icon="'video'"
    :empty-message="$t('noVideosYet')"
    :empty-button-text="$t('createFirstVideo')"
    @createNew="$emit('createNew')"
    @action="handleAction"
  >
    <!-- スクリプトタイトル -->
    <template #item-title="{ item }">
      <h3 class="font-semibold text-lg">{{ item.title }}</h3>
    </template>

    <!-- スクリプト内容 -->
    <template #item-content="{ item }">
      <p class="text-gray-600 mb-2">{{ item.description }}</p>
    </template>

    <!-- スクリプトメタ情報 -->
    <template #item-meta="{ item }">
      <div class="flex items-center gap-4 text-sm text-gray-500">
        <span v-if="item.projectName" class="text-blue-600">
          {{ $t("projectSettings") }}: {{ item.projectName }}
        </span>
        <span> {{ $t("createdAt") }}: {{ formatDate(item.createdAt) }} </span>
        <span :class="getStatusClass(item.status)">
          {{ item.status ? $t(item.status) : $t("draft") }}
        </span>
      </div>
    </template>
  </EntityList>
</template>

<script setup>
import EntityList from "@/components/EntityList.vue";
import { STANDARD_ACTIONS } from "@/utils/actionDefinitions.js";

const props = defineProps({
  videos: Array, // 実際は台本(scripts)のリストだが、親コンポーネントとの互換性のためvideosのまま維持
});

const emit = defineEmits(["delete", "createNew", "detail", "duplicate"]);

// スクリプト用のアクション定義
const scriptActions = [
  STANDARD_ACTIONS.view,
  STANDARD_ACTIONS.duplicate,
  STANDARD_ACTIONS.delete,
];

function handleAction({ action, item, index }) {
  switch (action) {
    case "view":
      emit("detail", index);
      break;
    case "duplicate":
      emit("duplicate", index);
      break;
    case "delete":
      emit("delete", index);
      break;
  }
}

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
