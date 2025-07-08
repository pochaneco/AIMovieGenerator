<template>
  <div class="bg-white rounded-lg shadow p-6">
    <!-- タイトルと基本情報を横並びに配置 -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h2 class="text-2xl font-bold">
          {{ title || defaultTitle }}
        </h2>
        <p v-if="subtitle" class="text-gray-600 text-sm mt-1">
          {{ subtitle }}
        </p>
      </div>

      <!-- 基本情報（右上に配置） -->
      <div class="flex flex-col items-end gap-1 text-sm text-gray-500 ml-6">
        <slot name="meta-info"></slot>
      </div>
    </div>

    <!-- 詳細情報 -->
    <div v-if="showDetails" class="mb-6">
      <slot name="details"></slot>
    </div>

    <!-- メインコンテンツ -->
    <slot></slot>

    <!-- アクション部分 -->
    <div v-if="showActions" class="flex gap-4 mt-6">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: null,
  },
  defaultTitle: {
    type: String,
    default: "詳細",
  },
  subtitle: {
    type: String,
    default: null,
  },
  showDetails: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
});
</script>
