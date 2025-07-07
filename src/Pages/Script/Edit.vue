<template>
  <div class="flex h-screen bg-gray-50">
    <!-- サイドメニュー -->
    <BaseLayout />

    <!-- メインコンテンツ -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-6xl mx-auto p-6">
        <!-- ヘッダー -->
        <div class="mb-6">
          <!-- パンくずナビゲーション -->
          <nav class="text-sm breadcrumbs mb-4">
            <router-link
              to="/generate"
              class="text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {{ $t("scriptGeneration") }}
            </router-link>
            <span class="mx-2">/</span>
            <router-link
              :to="`/script/${route.params.id}`"
              class="text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              {{ script.title || "台本詳細" }}
            </router-link>
            <span class="mx-2">/</span>
            <span class="text-gray-600">{{ $t("edit") }}</span>
          </nav>

          <!-- タイトルと情報アイコン -->
          <div class="flex items-center gap-3 mb-4">
            <h1 class="text-3xl font-bold text-gray-900">
              {{ script.title || "台本編集" }}
            </h1>
            <button
              @click="showInfoModal = true"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              :title="$t('viewDetails')"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- 台本内容表示 -->
        <div class="mb-6">
          <ScriptContentDisplay :script-content="scriptContent" />
        </div>

        <!-- 生成・停止ボタン -->
        <div class="flex gap-4 justify-center py-6">
          <CoolButton
            v-if="!isGenerating"
            @click="generateScript"
            color="primary"
            class="flex items-center gap-2 px-6 py-3"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {{ $t("generateScript") }}
          </CoolButton>

          <CoolButton
            v-if="isGenerating"
            @click="stopGeneration"
            color="danger"
            class="flex items-center gap-2 px-6 py-3"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 10h6v4H9z"
              />
            </svg>
            {{ $t("stopGeneration") }}
          </CoolButton>
        </div>

        <!-- 保存・キャンセルボタン -->
        <div class="flex gap-4 justify-center py-4 border-t">
          <CoolButton
            @click="saveScript"
            color="success"
            class="flex items-center gap-2 px-6 py-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ $t("save") }}
          </CoolButton>

          <CoolButton
            @click="cancelEdit"
            color="secondary"
            class="flex items-center gap-2 px-6 py-2"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {{ $t("cancel") }}
          </CoolButton>
        </div>
      </div>
    </main>

    <!-- 情報モーダル -->
    <div
      v-if="showInfoModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showInfoModal = false"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto"
        @click.stop
      >
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">{{ $t("scriptDetails") }}</h2>
          <button
            @click="showInfoModal = false"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- プロジェクト情報 -->
        <div v-if="project" class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">
            {{ $t("projectDetails") }}
          </h3>
          <div class="bg-gray-50 p-3 rounded">
            <p class="font-medium">{{ project.name }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ project.description }}</p>
          </div>
        </div>

        <!-- 台本説明 -->
        <div class="mb-4">
          <h3 class="font-semibold text-gray-700 mb-2">
            {{ $t("scriptDescription") }}
          </h3>
          <div class="bg-gray-50 p-3 rounded">
            <p class="text-sm text-gray-600">
              {{ script.description || "説明なし" }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import CoolButton from "@/components/CoolButton.vue";
import ScriptContentDisplay from "./Partials/ScriptContentDisplay.vue";
import {
  generateAIScript,
  generateStructuredScript,
  handleGenerationError,
} from "@/utils/scriptGenerator.js";
import { getScript, updateScript, getProject } from "@/services/dataService.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const script = ref({
  id: null,
  title: "",
  description: "",
  project: null,
  status: "draft",
  createdAt: null,
  updatedAt: null,
});

const project = ref(null);
const isGenerating = ref(false);
const showInfoModal = ref(false);

// 台本内容の配列
const scriptContent = ref([]);

// キーボードショートカット
function handleKeydown(event) {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    saveScript();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancelEdit();
  }
}

onMounted(() => {
  loadScript();
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});

async function loadScript() {
  try {
    const scriptIndex = parseInt(route.params.id);
    const scriptData = await getScript(scriptIndex);

    if (scriptData) {
      script.value = scriptData;
      await loadProject();
      // 既存の台本内容から構造化されたコンテンツを生成
      if (scriptData.structuredContent) {
        scriptContent.value = scriptData.structuredContent;
      } else if (scriptData.content) {
        // 既存のテキスト台本から構造化コンテンツを生成
        scriptContent.value = generateStructuredScript(
          scriptData,
          project.value
        );
      }
    } else {
      // 台本が見つからない場合は台本一覧にリダイレクト
      router.push("/generate");
    }
  } catch (error) {
    console.error("台本の読み込みに失敗しました:", error);
    router.push("/generate");
  }
}

async function loadProject() {
  if (script.value.projectId) {
    try {
      const projectData = await getProject(script.value.projectId);
      project.value = projectData;
    } catch (error) {
      console.error("プロジェクトの読み込みに失敗しました:", error);
    }
  }
}

function generateScript() {
  // 台本生成ユーティリティを使用（未実装のためアラートのみ）
  alert("台本生成機能は今後実装予定です");
  isGenerating.value = true;

  // 実際の実装例：
  // generateAIScript(script.value, project.value, (progress) => {
  //   console.log(`生成進捗: ${progress.message} (${progress.progress}%)`);
  // }).then(result => {
  //   if (result.success) {
  //     scriptContent.value = result.structuredContent;
  //     script.value.content = result.content;
  //     script.value.status = "completed";
  //   }
  // }).catch(error => {
  //   handleGenerationError(error);
  // }).finally(() => {
  //   isGenerating.value = false;
  // });

  // 3秒後に停止（デモ用）
  setTimeout(() => {
    isGenerating.value = false;
  }, 3000);
}

function stopGeneration() {
  isGenerating.value = false;
  alert("台本生成を停止しました");
}

async function saveScript() {
  try {
    // 構造化された台本コンテンツを台本データに保存
    script.value.structuredContent = scriptContent.value;
    script.value.updatedAt = new Date().toISOString();

    const scriptIndex = parseInt(route.params.id);
    await updateScript(scriptIndex, script.value);

    alert("台本が保存されました");
    // 詳細画面に戻る
    router.push(`/script/${route.params.id}`);
  } catch (error) {
    console.error("台本の保存に失敗しました:", error);
    alert("台本の保存に失敗しました");
  }
}

function cancelEdit() {
  // 編集をキャンセルして詳細画面に戻る
  router.push(`/script/${route.params.id}`);
}
</script>
