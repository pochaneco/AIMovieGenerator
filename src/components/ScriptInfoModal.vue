<template>
  <Modal
    :show="show"
    :title="$t('scriptDetails')"
    size="2xl"
    @close="$emit('close')"
  >
    <!-- プロジェクト情報 -->
    <div v-if="project" class="mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">
        {{ $t("projectDetails") }}
      </h3>
      <div class="bg-gray-50 p-3 rounded">
        <p class="font-medium">{{ project.name }}</p>
        <p class="text-sm text-gray-600 mt-1">{{ project.description }}</p>
      </div>
    </div>

    <!-- 台本説明 -->
    <div class="mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">
        {{ $t("scriptDescription") }}
      </h3>
      <div class="bg-gray-50 p-3 rounded">
        <p class="text-sm text-gray-600">
          {{ script.description || "説明なし" }}
        </p>
      </div>
    </div>

    <!-- 作成・更新日時 -->
    <div v-if="script.createdAt" class="mb-4">
      <h3 class="font-semibold text-gray-700 mb-2">
        {{ $t("detailInfo") }}
      </h3>
      <div class="bg-gray-50 p-3 rounded text-sm text-gray-600">
        <p>{{ $t("createdAt") }}: {{ formatDate(script.createdAt) }}</p>
        <p v-if="script.updatedAt">
          {{ $t("updatedAt") }}: {{ formatDate(script.updatedAt) }}
        </p>
        <p>{{ $t("status") }}: {{ getStatusLabel(script.status) }}</p>
      </div>
    </div>
  </Modal>
</template>

<script setup>
import Modal from "@/components/Modal.vue";

defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  script: {
    type: Object,
    required: true,
  },
  project: {
    type: Object,
    default: null,
  },
});

defineEmits(["close"]);

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString();
}

function getStatusLabel(status) {
  const statusLabels = {
    draft: "下書き",
    completed: "完了",
    failed: "失敗",
  };
  return statusLabels[status] || status;
}
</script>
