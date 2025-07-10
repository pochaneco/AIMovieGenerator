<template>
  <BaseLayout>
    <div class="max-w-6xl mx-auto">
      <!-- ヘッダー -->
      <div class="mb-6">
        <!-- パンくずナビゲーション -->
        <BreadcrumbSystem :items="breadcrumbItems" />

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
        <ScriptContentDisplay
          :script-content="scriptContent"
          :available-characters="availableCharacters"
          @add-scene="addScene"
          @add-line-to-scene="addLineToScene"
          @delete-scene="deleteScene"
          @delete-line="deleteLine"
          @move-scene="moveScene"
          @move-line="moveLine"
          @update-scene="updateScene"
          @update-line="updateLine"
        />
      </div>

      <!-- 台本設定 -->
      <ScriptSettingsForm v-if="!isGenerating" v-model="scriptSettings" />

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
          v-if="!isGenerating"
          @click="generateScriptWithAgent"
          variant="info"
          class="flex items-center gap-2 px-6 py-3"
          :disabled="!selectedConfig"
        >
          <Icon name="robot" />
          {{ $t("generateScriptWithAgent") }}
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

        <CoolButton
          @click="duplicateScript"
          variant="warning"
          class="flex items-center gap-2 px-6 py-2"
        >
          <Icon name="copy" size="sm" />
          {{ $t("duplicate") }}
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import Breadcrumb from "@/components/Breadcrumb.vue";
import BreadcrumbSystem from "@/components/BreadcrumbSystem.vue";
import LLMConfigSelector from "@/components/LLMConfigSelector.vue";
import ScriptInfoModal from "@/components/ScriptInfoModal.vue";
import ScriptContentDisplay from "./Partials/ScriptContentDisplay.vue";
import ScriptSettingsForm from "./Partials/ScriptSettingsForm.vue";
import {
  generateAIScript,
  generateStructuredScript,
  duplicateScript as duplicateScriptUtil,
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

const availableCharacters = computed(() => {
  return project.value?.characters || [];
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

// 台本設定
const scriptSettings = ref({
  totalDuration: 10, // 数値に変更
  sceneCount: 3,
  averageSceneDuration: 3, // 数値に変更
});

const project = ref(null);
const isGenerating = ref(false);
const showInfoModal = ref(false);

const scriptContent = ref([]);

// 古い構造を新しいネスト構造に変換
function convertToNestedStructure(oldContent) {
  const newContent = [];
  let currentScene = null;

  for (const item of oldContent) {
    if (item.type === "scene") {
      // 前のシーンがある場合は追加
      if (currentScene) {
        newContent.push(currentScene);
      }
      // 新しいシーンを開始
      currentScene = {
        ...item,
        lines: [],
      };
    } else if (
      item.type === "line" ||
      item.type === "narration" ||
      item.type === "action"
    ) {
      // セリフ等はシーンに追加
      if (currentScene) {
        currentScene.lines.push(item);
      } else {
        // シーンがない場合は、デフォルトシーンを作成
        currentScene = {
          id: Date.now() + Math.random(),
          type: "scene",
          title: "シーン1",
          content: "自動生成されたシーン",
          duration: 3, // 数値に変更
          lines: [item],
        };
      }
    } else {
      // その他のアイテム（ヘッダー、キャラクター紹介など）
      // 前のシーンがある場合は追加
      if (currentScene) {
        newContent.push(currentScene);
        currentScene = null;
      }
      newContent.push(item);
    }
  }

  // 最後のシーンを追加
  if (currentScene) {
    newContent.push(currentScene);
  }

  return newContent;
}

// シーン編集（現在はインライン編集に統合済み）
function openEditScene(idx) {
  // このメソッドは今後削除予定
  console.warn("openEditScene is deprecated. Use inline editing instead.");
}
function moveScene(oldIdx, newIdx) {
  if (
    oldIdx < 0 ||
    newIdx < 0 ||
    oldIdx >= scriptContent.value.length ||
    newIdx >= scriptContent.value.length
  ) {
    return;
  }

  const scenes = [...scriptContent.value];
  const [movedScene] = scenes.splice(oldIdx, 1);
  scenes.splice(newIdx, 0, movedScene);
  scriptContent.value = scenes;
}

// シーン削除
function deleteScene(idx) {
  if (idx < 0 || idx >= scriptContent.value.length) return;

  const scene = scriptContent.value[idx];
  if (!scene) return;

  // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
  const isScene = scene.title || scene.type === "scene";

  if (!isScene) {
    return;
  }

  if (confirm("このシーンを削除しますか？（保存するまで元に戻せます）")) {
    scriptContent.value.splice(idx, 1);
  }
}

// シーン追加
function addScene(position) {
  const newScene = {
    id: Date.now() + Math.random(),
    type: "scene",
    title: "新しいシーン",
    content: "シーンの説明を入力してください",
    duration: 3, // 数値に変更
    lines: [],
  };

  scriptContent.value.splice(position, 0, newScene);

  // 追加されたシーンを即座に編集モードに
  nextTick(() => {
    const event = new CustomEvent("start-edit", {
      detail: { index: `scene-${position}`, item: newScene },
    });
    document.dispatchEvent(event);
  });
}

// シーン更新
function updateScene(sceneIndex, updatedScene) {
  if (sceneIndex >= 0 && sceneIndex < scriptContent.value.length) {
    const scene = scriptContent.value[sceneIndex];
    // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
    const isScene = scene.title || scene.type === "scene";
    if (isScene) {
      scriptContent.value[sceneIndex] = {
        ...scene,
        ...updatedScene,
      };
    }
  }
}

// シーンにセリフを追加
function addLineToScene(sceneIndex) {
  const scene = scriptContent.value[sceneIndex];
  if (!scene) return;

  // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
  const isScene = scene.title || scene.type === "scene";
  if (!isScene) return;

  const characters = project.value?.characters || [];
  const defaultCharacter =
    characters.length > 0 ? characters[0].name : "キャラクター";

  const newLine = {
    id: Date.now() + Math.random(),
    type: "line",
    character: defaultCharacter,
    content: "新しいセリフを入力してください",
    emotion: "普通",
  };

  if (!scene.lines) {
    scene.lines = [];
  }

  scene.lines.push(newLine);

  // 追加されたセリフを即座に編集モードに
  nextTick(() => {
    const lineIndex = scene.lines.length - 1;
    const event = new CustomEvent("start-edit", {
      detail: { index: `line-${sceneIndex}-${lineIndex}`, item: newLine },
    });
    document.dispatchEvent(event);
  });
}

// セリフ削除
function deleteLine(sceneIndex, lineIndex) {
  const scene = scriptContent.value[sceneIndex];
  if (!scene || !scene.lines) return;

  // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
  const isScene = scene.title || scene.type === "scene";
  if (!isScene) return;

  if (confirm("このセリフを削除しますか？（保存するまで元に戻せます）")) {
    scene.lines.splice(lineIndex, 1);
  }
}

// セリフ移動
function moveLine(sceneIndex, oldLineIndex, newLineIndex) {
  const scene = scriptContent.value[sceneIndex];
  if (!scene || !scene.lines) return;

  // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
  const isScene = scene.title || scene.type === "scene";
  if (!isScene) return;

  if (
    oldLineIndex < 0 ||
    newLineIndex < 0 ||
    oldLineIndex >= scene.lines.length ||
    newLineIndex >= scene.lines.length
  ) {
    return;
  }

  const lines = [...scene.lines];
  const [movedLine] = lines.splice(oldLineIndex, 1);
  lines.splice(newLineIndex, 0, movedLine);
  scene.lines = lines;
}

// セリフ更新
function updateLine(sceneIndex, lineIndex, updatedLine) {
  const scene = scriptContent.value[sceneIndex];
  if (!scene || !scene.lines) return;

  // シーンかどうかを確認（title プロパティがあるか、もしくは type が 'scene' かで判定）
  const isScene = scene.title || scene.type === "scene";
  if (!isScene) return;

  if (lineIndex >= 0 && lineIndex < scene.lines.length) {
    scene.lines[lineIndex] = {
      ...scene.lines[lineIndex],
      ...updatedLine,
    };
  }
}

// 保留中の挿入位置を追跡
const pendingInsertPosition = ref(null);

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

      // 台本設定を読み込み
      if (scriptData.scriptSettings) {
        scriptSettings.value = { ...scriptData.scriptSettings };
      }

      await loadProject();
      // 既存の台本内容から構造化されたコンテンツを生成
      if (scriptData.structuredContent) {
        // 既存データが新しいネスト構造かどうかチェック
        const hasNestedStructure = scriptData.structuredContent.some(
          (item) => item.type === "scene" && Array.isArray(item.lines)
        );

        if (hasNestedStructure) {
          scriptContent.value = scriptData.structuredContent;
        } else {
          // 古い構造を新しい構造に変換
          scriptContent.value = convertToNestedStructure(
            scriptData.structuredContent
          );
        }
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

    // 台本設定をscriptデータに保存
    script.value.scriptSettings = { ...scriptSettings.value };

    // AI台本生成を実行（選択した設定とモデル、台本設定を使用）
    let generatedContent;
    try {
      const result = await generateAIScript(script.value, project.value, {
        configId: selectedLLMConfigId.value,
        modelName: selectedModel.value,
        scriptSettings: scriptSettings.value,
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
    // IndexedDB保存用にシリアライズ可能な形にする
    scriptContent.value = generatedContent;
    script.value.structuredContent = JSON.parse(
      JSON.stringify(generatedContent)
    );
    script.value.status = "completed";

    // データを保存
    const scriptIndex = parseInt(route.params.id);
    // IndexedDB保存用にディープコピー
    const safeScript = JSON.parse(JSON.stringify(script.value));
    await updateScript(scriptIndex, safeScript);

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
    // 構造化された台本コンテンツと設定を台本データに保存
    // IndexedDB保存用にシリアライズ可能な形にする
    script.value.structuredContent = JSON.parse(
      JSON.stringify(scriptContent.value)
    );
    script.value.scriptSettings = { ...scriptSettings.value };
    script.value.updatedAt = new Date().toISOString();

    const scriptIndex = parseInt(route.params.id);
    // IndexedDB保存用にディープコピー
    const safeScript = JSON.parse(JSON.stringify(script.value));
    await updateScript(scriptIndex, safeScript);

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

// Add the new function to handle the agent-based script generation
function generateScriptWithAgent() {
  isGenerating.value = true;
  generateStructuredScript(
    scriptSettings.value,
    selectedConfig.value,
    selectedModel.value
  )
    .then((result) => {
      scriptContent.value = result;
    })
    .catch((error) => {
      console.error("Error generating script with agent:", error);
    })
    .finally(() => {
      isGenerating.value = false;
    });
}

// Add the function to duplicate the script
async function duplicateScript() {
  try {
    const newScript = await duplicateScriptUtil(
      script.value,
      getMaxScriptId,
      addScript
    );
    alert("台本が複製されました");
    router.push(`/script/${newScript.id}`);
  } catch (error) {
    console.error("台本の複製に失敗しました:", error);
    alert("台本の複製に失敗しました");
  }
}
</script>
