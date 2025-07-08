<template>
  <div class="border-t pt-6">
    <h3 class="text-lg font-medium mb-4">
      {{ isEditing ? $t("editConfig") : $t("addNewConfig") }}
    </h3>

    <form @submit.prevent="handleSubmit">
      <!-- 設定名 -->
      <FormField
        v-model="formData.name"
        type="text"
        :label="$t('configName')"
        :placeholder="$t('configNamePlaceholder')"
        required
      />

      <!-- プロバイダー選択 -->
      <FormField
        v-model="formData.provider"
        type="select"
        :label="$t('provider')"
        :placeholder="$t('selectProvider')"
        :options="providerOptions"
        required
      />

      <!-- APIキー -->
      <FormField
        v-model="formData.apiKey"
        type="password"
        :label="$t('apiKey')"
        :placeholder="$t('apiKeyPlaceholder')"
        required
      />

      <!-- デフォルトモデル -->
      <FormField
        v-model="formData.defaultModel"
        type="select"
        :label="$t('defaultModel')"
        :placeholder="$t('selectModel')"
        :options="modelOptions"
        required
      />

      <!-- テストボタン -->
      <div class="mb-4">
        <CoolButton
          type="button"
          @click="$emit('test-config', formData)"
          :disabled="!canTest || testing"
          variant="warning"
          size="sm"
        >
          {{ testing ? $t("testing") : $t("testConnection") }}
        </CoolButton>

        <!-- テスト結果 -->
        <StatusMessage
          v-if="testResult"
          :type="testResult.success ? 'success' : 'error'"
          :message="
            testResult.success
              ? $t('connectionSuccess')
              : `${$t('connectionFailed')}: ${testResult.error}`
          "
          class="mt-2"
        />
      </div>

      <!-- 保存・キャンセルボタン -->
      <div class="flex space-x-4">
        <CoolButton type="submit" :disabled="!canSave" variant="primary">
          {{ isEditing ? $t("update") : $t("save") }}
        </CoolButton>
        <CoolButton type="button" @click="$emit('cancel')" variant="secondary">
          {{ $t("cancel") }}
        </CoolButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed } from "vue";
import FormField from "@/components/FormField.vue";
import StatusMessage from "@/components/StatusMessage.vue";
import CoolButton from "@/components/CoolButton.vue";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  availableProviders: {
    type: Array,
    required: true,
  },
  availableModels: {
    type: Array,
    required: true,
  },
  testing: {
    type: Boolean,
    default: false,
  },
  testResult: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["test-config", "submit", "cancel"]);

// フォームオプション
const providerOptions = computed(() =>
  props.availableProviders.map((provider) => ({
    value: provider.id,
    label: `${provider.icon} ${provider.name}`,
  }))
);

const modelOptions = computed(() =>
  props.availableModels.map((model) => ({
    value: model,
    label: model,
  }))
);

// フォーム状態
const canTest = computed(
  () =>
    props.formData.apiKey &&
    props.formData.provider &&
    props.formData.defaultModel
);

const canSave = computed(
  () =>
    props.formData.name &&
    props.formData.provider &&
    props.formData.apiKey &&
    props.formData.defaultModel
);

const handleSubmit = () => {
  if (canSave.value) {
    emit("submit");
  }
};
</script>
