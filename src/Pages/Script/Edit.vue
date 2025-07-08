<template>
  <BaseLayout>
    <div class="max-w-6xl mx-auto">
      <!-- ヘッダー -->
      <div class="mb-6">
        <!-- パンくずナビゲーション -->
        <Breadcrumb :items="breadcrumbItems" />

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
            <Icon name="info" />
          </button>
        </div>
      </div>

      <!-- 台本内容表示 -->
      <div class="mb-6">
        <ScriptContentDisplay :script-content="scriptContent" />
      </div>

      <!-- LLM設定とモデル選択 -->
      <LLMConfigSelector
        v-if="!isGenerating"
        v-model:selected-config-id="selectedLLMConfigId"
        v-model:selected-model="selectedModel"
        :available-configs="availableLLMConfigs"
        :available-models="availableModels"
      />

      <!-- 生成・停止ボタン -->
      <div class="flex gap-4 justify-center py-6">
        <CoolButton
          v-if="!isGenerating"
          @click="generateScript"
          variant="primary"
          class="flex items-center gap-2 px-6 py-3"
          :disabled="!selectedConfig"
        >
          <Icon name="lightning" />
          {{ $t("generateScript") }}
        </CoolButton>

        <CoolButton
          v-if="isGenerating"
          @click="stopGeneration"
          variant="danger"
          class="flex items-center gap-2 px-6 py-3"
        >
          <Icon name="stop" />
          {{ $t("stopGeneration") }}
        </CoolButton>
      </div>

      <!-- 保存・キャンセルボタン -->
      <div class="flex gap-4 justify-center py-4 border-t">
        <CoolButton
          @click="saveScript"
          variant="success"
          class="flex items-center gap-2 px-6 py-2"
        >
          <Icon name="check" size="sm" />
          {{ $t("save") }}
        </CoolButton>

        <CoolButton
          @click="cancelEdit"
          variant="secondary"
          class="flex items-center gap-2 px-6 py-2"
        >
          <Icon name="close" size="sm" />
          {{ $t("cancel") }}
        </CoolButton>
      </div>
    </div>

    <!-- 情報モーダル -->
    <ScriptInfoModal
      :show="showInfoModal"
      :script="script"
      :project="project"
      @close="showInfoModal = false"
    />
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import LLMConfigSelector from "@/components/LLMConfigSelector.vue";
import ScriptInfoModal from "@/components/ScriptInfoModal.vue";
import ScriptContentDisplay from "./Partials/ScriptContentDisplay.vue";
import {
  generateAIScript,
  generateStructuredScript,
} from "@/utils/scriptGenerator.js";
import {
  getScript,
  updateScript,
  getProject,
  getActiveLLMConfig,
  getLLMConfigs,
} from "@/services/dataService.js";
import { getAvailableModels } from "@/utils/llmService.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// LLM設定関連
const availableLLMConfigs = ref([]);
const selectedLLMConfigId = ref("");
const selectedModel = ref("");

const selectedConfig = computed(() => {
  return availableLLMConfigs.value.find(
    (config) => config.id === selectedLLMConfigId.value
  );
});

const availableModels = computed(() => {
  if (!selectedConfig.value) return [];
  return getAvailableModels(selectedConfig.value.provider);
});

const breadcrumbItems = computed(() => [
  { label: t("scriptGeneration"), to: "/generate" },
  {
    label: script.value.title || "台本詳細",
    to: `/script/${route.params.id}`,
  },
  { label: t("edit"), current: true },
]);

// 選択された設定が変わった時にモデルをデフォルトに設定
watch(selectedLLMConfigId, (newConfigId) => {
  const config = availableLLMConfigs.value.find((c) => c.id === newConfigId);
  if (config) {
    selectedModel.value = config.defaultModel;
  }
});

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

onMounted(async () => {
  await loadLLMConfigs();
  loadScript();
  document.addEventListener("keydown", handleKeydown);
});

async function loadLLMConfigs() {
  try {
    availableLLMConfigs.value = await getLLMConfigs();
    const activeConfig = await getActiveLLMConfig();

    if (activeConfig) {
      selectedLLMConfigId.value = activeConfig.id;
      selectedModel.value = activeConfig.defaultModel;
    } else if (availableLLMConfigs.value.length > 0) {
      selectedLLMConfigId.value = availableLLMConfigs.value[0].id;
      selectedModel.value = availableLLMConfigs.value[0].defaultModel;
    }
  } catch (error) {
    console.error("LLM設定の読み込みに失敗しました:", error);
  }
}

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

async function generateScript() {
  if (!script.value || !project.value) {
    alert("スクリプトまたはプロジェクト情報が読み込まれていません");
    return;
  }

  if (!selectedConfig.value) {
    alert("LLM設定を選択してください");
    return;
  }

  isGenerating.value = true;

  try {
    // 生成前の確認メッセージ
    const confirmed = confirm(
      "AIを使用して台本を生成しますか？既存の内容は上書きされます。"
    );
    if (!confirmed) {
      isGenerating.value = false;
      return;
    }

    // AI台本生成を実行（選択した設定とモデルを使用）
    let generatedContent;
    try {
      const result = await generateAIScript(script.value, project.value, {
        configId: selectedLLMConfigId.value,
        modelName: selectedModel.value,
      });
      generatedContent = result.structuredContent;
      console.log(
        `AI台本生成成功 (${selectedConfig.value.name} - ${selectedModel.value})`
      );
    } catch (aiError) {
      console.warn(
        "AI生成に失敗、構造化台本生成にフォールバック:",
        aiError.message
      );
      // AI生成に失敗した場合は構造化台本生成にフォールバック
      generatedContent = generateStructuredScript(script.value, project.value);

      // ユーザーにフォールバック情報を通知
      alert(
        `AI生成に失敗しました: ${aiError.message}\n構造化台本を生成しました。`
      );
    }

    // 生成された内容をscriptContentに反映
    scriptContent.value = generatedContent;
    script.value.structuredContent = generatedContent;
    script.value.status = "completed";

    // データを保存
    const scriptIndex = parseInt(route.params.id);
    await updateScript(scriptIndex, script.value);

    console.log("台本生成完了");
  } catch (error) {
    console.error("台本生成エラー:", error);
    alert(`台本生成に失敗しました: ${error.message}`);
  } finally {
    isGenerating.value = false;
  }
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
