<template>
  <div class="p-4 border-t">
    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input
        :model-value="message"
        @input="$emit('update:message', $event.target.value)"
        type="text"
        class="flex-1 border rounded px-3 py-2 text-sm"
        :placeholder="$t('typeMessage')"
        :disabled="isTyping || availableConfigs.length === 0"
      />
      <button
        type="submit"
        :disabled="!message.trim() || isTyping || availableConfigs.length === 0"
        class="px-3 py-2 bg-sky-500 text-white rounded text-sm hover:bg-sky-600 disabled:bg-gray-300 transition-colors"
      >
        <Icon name="send" size="sm" />
      </button>
    </form>

    <!-- 設定がない場合の警告 -->
    <div v-if="availableConfigs.length === 0" class="mt-2 text-xs text-red-600">
      {{ $t("noLLMConfigWarning") }}
      <router-link to="/settings" class="underline ml-1">
        {{ $t("goToSettings") }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import Icon from "./Icon.vue";

const { t } = useI18n();

defineProps({
  message: {
    type: String,
    required: true,
  },
  isTyping: {
    type: Boolean,
    default: false,
  },
  availableConfigs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:message", "sendMessage"]);

function handleSubmit() {
  emit("sendMessage");
}
</script>
