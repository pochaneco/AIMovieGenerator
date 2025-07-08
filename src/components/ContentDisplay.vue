<template>
  <div class="mb-6">
    <h3 class="font-semibold text-gray-700 mb-3">
      {{ title }}
    </h3>

    <!-- 生成中の表示 -->
    <div
      v-if="status === 'generating'"
      class="bg-gray-50 p-8 rounded border text-center"
    >
      <div
        class="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
      ></div>
      <p class="text-gray-600">{{ loadingMessage }}</p>
    </div>

    <!-- 生成失敗の表示 -->
    <div
      v-else-if="status === 'failed'"
      class="bg-red-50 p-8 rounded border text-center text-red-600"
    >
      <Icon name="error" size="2xl" class="mx-auto text-red-400 mb-4" />
      <p>{{ errorMessage }}</p>
    </div>

    <!-- コンテンツの表示 -->
    <div v-else-if="content" class="bg-gray-50 p-4 rounded border min-h-96">
      <pre v-if="!isHtml" class="whitespace-pre-wrap text-gray-800">{{
        content
      }}</pre>
      <div v-else v-html="content" class="text-gray-800"></div>
    </div>

    <!-- コンテンツが未生成の場合 -->
    <div v-else class="bg-gray-50 p-8 rounded border text-center text-gray-500">
      <Icon :name="emptyIcon" size="2xl" class="mx-auto text-gray-400 mb-4" />
      <p class="mb-4">{{ emptyMessage }}</p>
      <div v-if="showActions" class="flex gap-3 justify-center">
        <slot name="empty-actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icon from "@/components/Icon.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: null,
  },
  content: {
    type: String,
    default: null,
  },
  loadingMessage: {
    type: String,
    required: true,
  },
  errorMessage: {
    type: String,
    required: true,
  },
  emptyMessage: {
    type: String,
    required: true,
  },
  emptyIcon: {
    type: String,
    default: "document",
  },
  showActions: {
    type: Boolean,
    default: true,
  },
  isHtml: {
    type: Boolean,
    default: false,
  },
});
</script>
