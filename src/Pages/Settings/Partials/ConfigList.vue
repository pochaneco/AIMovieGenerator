<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium">{{ $t("savedLLMConfigs") }}</h3>
      <CoolButton @click="$emit('add-config')" variant="success" size="sm">
        {{ $t("addNewConfig") }}
      </CoolButton>
    </div>

    <!-- 設定一覧 -->
    <div v-if="configs.length > 0" class="space-y-3">
      <div
        v-for="config in configs"
        :key="config.id"
        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        :class="{
          'border-blue-500 bg-blue-50': config.id === activeConfigId,
        }"
      >
        <div class="flex items-center space-x-4">
          <div class="text-2xl">
            {{ providerInfo[config.provider]?.icon || "🤖" }}
          </div>
          <div>
            <div class="font-medium">{{ config.name }}</div>
            <div class="text-sm text-gray-500">
              {{ providerInfo[config.provider]?.name }} -
              {{ config.defaultModel }}
            </div>
            <div class="text-xs text-gray-400">
              {{ $t("created") }}: {{ formatDate(config.createdAt) }}
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <!-- アクティブ状態表示 -->
          <span
            v-if="config.id === activeConfigId"
            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {{ $t("active") }}
          </span>
          <!-- アクティブ設定ボタン -->
          <CoolButton
            v-if="config.id !== activeConfigId"
            @click="$emit('set-active', config.id)"
            variant="info"
            size="xs"
          >
            {{ $t("setActive") }}
          </CoolButton>
          <!-- 編集ボタン -->
          <CoolButton
            @click="$emit('edit-config', config)"
            variant="secondary"
            size="xs"
          >
            {{ $t("edit") }}
          </CoolButton>
          <!-- 削除ボタン -->
          <CoolButton
            @click="$emit('delete-config', config.id)"
            variant="danger"
            size="xs"
          >
            {{ $t("delete") }}
          </CoolButton>
        </div>
      </div>
    </div>

    <!-- 設定がない場合 -->
    <div v-else class="text-center py-8 text-gray-500">
      <div class="text-4xl mb-2">🤖</div>
      <div>{{ $t("noLLMConfigs") }}</div>
      <div class="text-sm">{{ $t("addFirstConfig") }}</div>
    </div>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";

defineProps({
  configs: {
    type: Array,
    required: true,
  },
  activeConfigId: {
    type: String,
    default: null,
  },
  providerInfo: {
    type: Object,
    required: true,
  },
});

defineEmits(["add-config", "set-active", "edit-config", "delete-config"]);

// 日付フォーマット関数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
</script>
