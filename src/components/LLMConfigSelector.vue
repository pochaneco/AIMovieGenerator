<template>
  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
    <h4 class="font-medium mb-3 text-gray-700">
      {{ $t("generationSettings") }}
    </h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- LLM設定選択 -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">{{
          $t("llmConfig")
        }}</label>
        <select
          :model-value="selectedConfigId"
          @update:model-value="$emit('update:selectedConfigId', $event)"
          class="w-full border rounded px-3 py-2 text-sm"
          :disabled="availableConfigs.length === 0"
        >
          <option value="" disabled>{{ $t("selectLLMConfig") }}</option>
          <option
            v-for="config in availableConfigs"
            :key="config.id"
            :value="config.id"
          >
            {{ config.name }} ({{ PROVIDER_INFO[config.provider]?.name }})
          </option>
        </select>
      </div>

      <!-- モデル選択 -->
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">{{
          $t("model")
        }}</label>
        <select
          :model-value="selectedModel"
          @update:model-value="$emit('update:selectedModel', $event)"
          class="w-full border rounded px-3 py-2 text-sm"
          :disabled="!currentConfig"
        >
          <option v-for="model in availableModels" :key="model" :value="model">
            {{ model }}
          </option>
        </select>
      </div>
    </div>

    <!-- 現在の設定表示 -->
    <div v-if="currentConfig" class="mt-3 p-2 bg-blue-50 rounded text-sm">
      <div class="flex items-center text-blue-700">
        <span class="text-lg mr-2">{{
          PROVIDER_INFO[currentConfig.provider]?.icon
        }}</span>
        <span>{{ currentConfig.name }} - {{ selectedModel }}</span>
      </div>
    </div>

    <!-- 設定がない場合の警告 -->
    <div
      v-if="availableConfigs.length === 0"
      class="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700"
    >
      ⚠️ {{ $t("noLLMConfigsWarning") }}
      <router-link to="/settings" class="text-yellow-800 underline ml-1">{{
        $t("goToSettings")
      }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { PROVIDER_INFO } from "@/utils/llmService.js";

const props = defineProps({
  availableConfigs: {
    type: Array,
    default: () => [],
  },
  selectedConfigId: {
    type: String,
    default: "",
  },
  selectedModel: {
    type: String,
    default: "",
  },
  availableModels: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:selectedConfigId", "update:selectedModel"]);

const currentConfig = computed(() => {
  return props.availableConfigs.find(
    (config) => config.id === props.selectedConfigId
  );
});
</script>
