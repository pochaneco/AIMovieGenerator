<template>
  <div>
    <div class="mb-6">
      <!-- パンくずナビゲーション -->
      <Breadcrumb :items="breadcrumbItems" @navigate="handleNavigation" />

      <button
        @click="$emit('back')"
        class="flex items-center text-blue-500 hover:text-blue-600 mb-4"
      >
        <Icon name="back" class="mr-2" />
        {{ $t("back") }}
      </button>

      <EntityHeader :title="script.title" default-title="台本タイトル">
        <!-- メタ情報 -->
        <template #meta-info>
          <span v-if="script.projectName" class="text-blue-600">
            {{ $t("projectSettings") }}: {{ script.projectName }}
          </span>
          <span>
            {{ $t("createdAt") }}: <DateFormat :date="script.createdAt" />
          </span>
          <StatusBadge :status="script.status" />
        </template>

        <!-- 詳細情報 -->
        <template #details>
          <!-- 台本説明 -->
          <div class="mb-4">
            <h3 class="font-semibold text-gray-700 mb-2">
              {{ $t("description") }}
            </h3>
            <p class="text-gray-600 text-sm">
              {{ script.description || "説明なし" }}
            </p>
          </div>

          <!-- プロジェクト詳細情報 -->
          <ProjectDetails
            :project="projectDetails"
            :no-project-message="'このスクリプトにはプロジェクト詳細情報が関連付けられていません。'"
          />
        </template>

        <!-- メインコンテンツ -->
        <ContentDisplay
          :title="$t('scriptContent')"
          :status="script.status"
          :content="script.content"
          :loading-message="$t('generatingScript')"
          :error-message="$t('scriptGenerationFailed')"
          :empty-message="$t('noScriptContent')"
          empty-icon="document"
        >
          <template #empty-actions>
            <CoolButton
              @click="$emit('generate')"
              color="primary"
              :disabled="generating"
            >
              {{ $t("generateScript") }}
            </CoolButton>
            <CoolButton
              @click="$emit('edit')"
              color="secondary"
              :disabled="generating"
            >
              {{ $t("editBasicInfo") }}
            </CoolButton>
          </template>
        </ContentDisplay>

        <!-- アクションボタン -->
        <template #actions>
          <CoolButton
            v-if="!script.content || script.status === 'draft'"
            @click="$emit('generate')"
            color="primary"
            :disabled="generating"
          >
            {{ generating ? $t("generating") : $t("generateScript") }}
          </CoolButton>

          <CoolButton
            v-if="script.content && script.status === 'completed'"
            @click="$emit('regenerate')"
            color="success"
            :disabled="generating"
          >
            {{ generating ? $t("generating") : $t("regenerateScript") }}
          </CoolButton>

          <!-- 編集ボタン（常に表示、未生成でも基本情報を編集可能） -->
          <CoolButton
            @click="$emit('edit')"
            color="secondary"
            :disabled="generating"
          >
            {{ script.content ? $t("edit") : $t("editBasicInfo") }}
          </CoolButton>
        </template>
      </EntityHeader>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import CoolButton from "@/components/CoolButton.vue";
import ProjectDetails from "@/components/ProjectDetails.vue";
import Icon from "@/components/Icon.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import StatusBadge from "@/components/StatusBadge.vue";
import ContentDisplay from "@/components/ContentDisplay.vue";
import EntityHeader from "@/components/EntityHeader.vue";
import DateFormat from "@/components/DateFormat.vue";

const { t } = useI18n();

const props = defineProps({
  script: Object,
  projectDetails: Object,
  generating: Boolean,
});

const emit = defineEmits([
  "back",
  "backToList",
  "generate",
  "regenerate",
  "edit",
]);

// パンくずナビゲーションのアイテム
const breadcrumbItems = computed(() => [
  {
    label: t("scriptGeneration"),
    clickable: true,
    action: "back",
  },
  {
    label: t("createdList"),
    clickable: true,
    action: "backToList",
  },
  {
    label: props.script.title || "台本詳細",
    clickable: false,
  },
]);

// パンくずナビゲーションのクリック処理
function handleNavigation(action) {
  emit(action);
}

// プロジェクト詳細データのデバッグ
watch(
  () => props.projectDetails,
  (newVal) => {
    console.log("ScriptDetail - Project details updated:", newVal);
  },
  { immediate: true }
);
</script>
