<template>
  <div v-if="availableConfigs.length > 0" class="flex items-center gap-2">
    <select
      :model-value="selectedConfigAndModel"
      @change="handleModelChange"
      class="text-xs text-sky-800 bg-white border border-sky-400 rounded px-2 py-1 max-w-32 truncate"
      :title="$t('selectModel')"
    >
      <optgroup
        v-for="config in availableConfigs"
        :key="config.id"
        :label="config.name"
      >
        <option
          v-for="model in getAvailableModels(config.provider)"
          :key="`${config.id}-${model}`"
          :value="`${config.id}|${model}`"
        >
          {{ model }}
        </option>
      </optgroup>
    </select>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { getAvailableModels } from "@/utils/llmService.js";

const { t } = useI18n();

const props = defineProps({
  selectedConfigAndModel: {
    type: String,
    required: true,
  },
  availableConfigs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["modelChange"]);

function handleModelChange(event) {
  emit("modelChange", event.target.value);
}
</script>
