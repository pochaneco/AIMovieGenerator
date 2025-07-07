<template>
  <div>
    <div class="mb-6">
      <!-- パンくずナビゲーション -->
      <nav class="text-sm breadcrumbs mb-4">
        <button
          @click="$emit('back')"
          class="text-blue-500 hover:text-blue-600"
        >
          {{ $t("scriptGeneration") }}
        </button>
        <span class="mx-2">/</span>
        <button
          @click="$emit('backToList')"
          class="text-blue-500 hover:text-blue-600"
        >
          {{ $t("createdList") }}
        </button>
        <span class="mx-2">/</span>
        <span class="text-gray-600">{{ script.title || "台本詳細" }}</span>
      </nav>

      <button
        @click="$emit('back')"
        class="flex items-center text-blue-500 hover:text-blue-600 mb-4"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ $t("back") }}
      </button>

      <div class="bg-white rounded-lg shadow p-6">
        <!-- タイトルと基本情報を横並びに配置 -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold">
              {{ script.title || "台本タイトル" }}
            </h2>
          </div>

          <!-- 基本情報（右上に配置） -->
          <div class="flex flex-col items-end gap-1 text-sm text-gray-500 ml-6">
            <span v-if="script.projectName" class="text-blue-600">
              {{ $t("projectSettings") }}: {{ script.projectName }}
            </span>
            <span>
              {{ $t("createdAt") }}: {{ formatDate(script.createdAt) }}
            </span>
            <span :class="getStatusClass(script.status)" class="font-medium">
              {{ script.status ? $t(script.status) : $t("draft") }}
            </span>
          </div>
        </div>

        <!-- 詳細情報（常に表示） -->
        <div class="mb-6">
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
        </div>

        <!-- 台本コンテンツ -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-700 mb-3">
            {{ $t("scriptContent") }}
          </h3>

          <!-- 生成中の表示 -->
          <div
            v-if="script.status === 'generating'"
            class="bg-gray-50 p-8 rounded border text-center"
          >
            <div
              class="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            ></div>
            <p class="text-gray-600">{{ $t("generatingScript") }}</p>
          </div>

          <!-- 生成失敗の表示 -->
          <div
            v-else-if="script.status === 'failed'"
            class="bg-red-50 p-8 rounded border text-center text-red-600"
          >
            <svg
              class="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>{{ $t("scriptGenerationFailed") }}</p>
          </div>

          <!-- 台本内容の表示 -->
          <div
            v-else-if="script.content"
            class="bg-gray-50 p-4 rounded border min-h-96"
          >
            <pre class="whitespace-pre-wrap text-gray-800">{{
              script.content
            }}</pre>
          </div>

          <!-- 台本が未生成の場合 -->
          <div
            v-else
            class="bg-gray-50 p-8 rounded border text-center text-gray-500"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p class="mb-4">{{ $t("noScriptContent") }}</p>
            <div class="flex gap-3 justify-center">
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
            </div>
          </div>
        </div>

        <!-- アクションボタン -->
        <div class="flex gap-4">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import CoolButton from "@/components/CoolButton.vue";
import ProjectDetails from "@/components/ProjectDetails.vue";

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

// プロジェクト詳細データのデバッグ
watch(
  () => props.projectDetails,
  (newVal) => {
    console.log("ScriptDetail - Project details updated:", newVal);
  },
  { immediate: true }
);

function formatDate(dateString) {
  if (!dateString) return "日時不明";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  if (!status) return "text-gray-600";
  switch (status) {
    case "generating":
      return "text-blue-600";
    case "completed":
      return "text-green-600";
    case "draft":
      return "text-gray-600";
    case "failed":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}
</script>
