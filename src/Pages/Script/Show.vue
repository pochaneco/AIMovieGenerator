<template>
  <div class="flex h-screen bg-gray-50">
    <!-- サイドメニュー -->
    <BaseLayout />

    <!-- メインコンテンツ -->
    <main class="flex-1 overflow-auto">
      <div class="max-w-4xl mx-auto p-6">
        <ScriptDetail
          :script="script"
          :project-details="project"
          :generating="isGenerating"
          @back="goBack"
          @back-to-list="goBackToList"
          @generate="generateScript"
          @regenerate="regenerateScript"
          @edit="editScript"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ScriptDetail from "./Partials/ScriptDetail.vue";
import {
  generateAIScript,
  handleGenerationError,
} from "@/utils/scriptGenerator.js";
import { getScript, updateScript, getProject } from "@/services/dataService.js";

const route = useRoute();
const router = useRouter();

const script = ref({
  title: "",
  description: "",
  status: "draft",
  projectName: "",
  createdAt: new Date().toISOString(),
});
const project = ref(null);
const isGenerating = ref(false);

onMounted(() => {
  loadScript();
});

async function loadScript() {
  try {
    const scriptIndex = parseInt(route.params.id);
    const scriptData = await getScript(scriptIndex);

    if (scriptData) {
      script.value = scriptData;
      await loadProject();
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
      console.log("Found project:", project.value);
    } catch (error) {
      console.error("プロジェクトの読み込みに失敗しました:", error);
    }
  } else {
    console.log("No project ID in script:", script.value);
  }
}

function goBack() {
  router.push("/generate");
}

function goBackToList() {
  router.push("/generate?tab=list");
}

async function generateScript() {
  if (isGenerating.value) return;

  isGenerating.value = true;
  script.value.status = "generating";
  await updateScriptData();

  try {
    // AI台本生成ユーティリティを使用
    const result = await generateAIScript(
      script.value,
      project.value,
      (progress) => {
        console.log(`生成進捗: ${progress.message} (${progress.progress}%)`);
      }
    );

    if (result.success) {
      script.value.content = result.content;
      script.value.structuredContent = result.structuredContent;
      script.value.status = "completed";
      script.value.generatedAt = result.generatedAt;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    const errorInfo = handleGenerationError(error);
    script.value.status = "failed";
    script.value.error = errorInfo.error;
  } finally {
    isGenerating.value = false;
    await updateScriptData();
  }
}

async function regenerateScript() {
  if (isGenerating.value) return;

  const confirmed = confirm(
    "台本を再生成しますか？現在の内容は上書きされます。"
  );
  if (!confirmed) return;

  script.value.content = "";
  script.value.status = "draft";
  await generateScript();
}

function editScript() {
  // Edit画面に遷移
  router.push(`/script/${route.params.id}/edit`);
}

async function updateScriptData() {
  try {
    const scriptIndex = parseInt(route.params.id);
    await updateScript(scriptIndex, script.value);
  } catch (error) {
    console.error("台本の更新に失敗しました:", error);
  }
}
</script>
