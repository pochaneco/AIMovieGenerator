<template>
  <div>
    <p class="mb-6 text-gray-600">
      {{ $t("generateDescription") }}
    </p>
    <form @submit.prevent="$emit('submit')">
      <!-- プロジェクト選択 -->
      <ProjectSelector
        v-model="form.projectId"
        :projects="projects"
        @update:modelValue="$emit('update:projectId', $event)"
      />

      <!-- 選択したプロジェクトの説明を表示 -->
      <ProjectSummary :project="selectedProject" />

      <!-- タイトル入力 -->
      <FormField
        v-model="form.title"
        type="text"
        :label="$t('videoTitle')"
        :placeholder="$t('videoTitlePlaceholder')"
        required
        @update:modelValue="$emit('update:title', $event)"
      />

      <!-- 説明入力 -->
      <FormField
        v-model="form.description"
        type="textarea"
        :label="$t('description')"
        :placeholder="$t('descriptionPlaceholder')"
        :rows="3"
        required
        @update:modelValue="$emit('update:description', $event)"
      />

      <!-- 送信ボタンのスロット（デフォルトボタンの代わりに使用可能） -->
      <slot name="submit-button">
        <CoolButton
          type="submit"
          :text="$t('save')"
          :loading-text="$t('saving')"
          :loading="loading"
          :disabled="loading"
          >{{ $t("save") }}</CoolButton
        >
      </slot>
    </form>

    <!-- ステータスメッセージ -->
    <StatusMessage
      v-if="loading"
      type="loading"
      :message="$t('saving') + '...'"
    />
    <StatusMessage v-if="error" type="error" :message="error" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import ProjectSelector from "@/components/ProjectSelector.vue";
import ProjectSummary from "@/components/ProjectSummary.vue";
import FormField from "@/components/FormField.vue";
import CoolButton from "@/components/CoolButton.vue";
import StatusMessage from "@/components/StatusMessage.vue";

const props = defineProps({
  form: Object,
  loading: Boolean,
  error: String,
  projects: Array,
});

const emit = defineEmits([
  "submit",
  "update:title",
  "update:description",
  "update:projectId",
]);

// 選択されたプロジェクトを算出
const selectedProject = computed(() => {
  if (!props.form.projectId || !props.projects) return null;
  return props.projects.find(
    (p) => String(p.id) === String(props.form.projectId)
  );
});
</script>
