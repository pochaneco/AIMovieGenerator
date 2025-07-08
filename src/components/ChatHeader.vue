<template>
  <div
    class="flex items-center justify-between p-4 border-b bg-sky-500 text-white"
  >
    <div class="flex items-center gap-3">
      <Icon name="chat" size="md" class="text-white" />
      <ModelSelector
        :selected-config-and-model="selectedConfigAndModel"
        :available-configs="availableConfigs"
        @model-change="$emit('modelChange', $event)"
      />
    </div>
    <div class="flex items-center gap-2">
      <button
        @click="$emit('downloadChat')"
        class="p-1 hover:bg-sky-600 rounded"
        :title="$t('downloadChat')"
      >
        <Icon name="download" size="sm" />
      </button>
      <button
        @click="$emit('clearChat')"
        class="p-1 hover:bg-sky-600 rounded"
        :title="$t('clearChat')"
      >
        <Icon name="delete" size="sm" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import Icon from "./Icon.vue";
import ModelSelector from "./ModelSelector.vue";

const { t } = useI18n();

defineProps({
  selectedConfigAndModel: {
    type: String,
    required: true,
  },
  availableConfigs: {
    type: Array,
    required: true,
  },
});

defineEmits(["modelChange", "downloadChat", "clearChat"]);
</script>
