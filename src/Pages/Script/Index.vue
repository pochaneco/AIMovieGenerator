<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 class="text-2xl font-bold mb-4">{{ $t("generateMovie") }}</h2>

      <!-- タブナビゲーション -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'create'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ $t("newCreate") }}
          </button>
          <button
            @click="activeTab = 'list'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ $t("createdList") }}
          </button>
        </nav>
      </div>

      <!-- 新規作成タブ -->
      <div v-show="activeTab === 'create'">
        <ScriptGenerateForm
          :form="form"
          :loading="loading"
          :error="error"
          :projects="projects"
          @submit="onSave"
          @update:title="form.title = $event"
          @update:description="form.description = $event"
          @update:projectId="form.projectId = $event"
        />
      </div>

      <!-- 台本リストタブ -->
      <div v-show="activeTab === 'list'">
        <ScriptList
          :videos="generatedScripts"
          @delete="deleteScriptItem"
          @preview="previewScript"
          @detail="goToDetail"
          @createNew="activeTab = 'create'"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ScriptGenerateForm from "./Partials/ScriptGenerateForm.vue";
import ScriptList from "./Partials/ScriptList.vue";
import {
  getScripts,
  createScript,
  getProjects,
  deleteScript,
} from "@/services/dataService.js";

const router = useRouter();
const route = useRoute();

const form = reactive({
  title: "",
  description: "",
  projectId: "",
});
const loading = ref(false);
const error = ref("");
const activeTab = ref("create"); // デフォルトは新規作成タブ
const generatedScripts = ref([]);
const projects = ref([]);

onMounted(async () => {
  await loadGeneratedScripts();
  await loadProjects();

  // クエリパラメータからタブを設定
  if (route.query.tab === "list") {
    activeTab.value = "list";
  }
});

// タブ変更時にクエリパラメータも更新
watch(activeTab, (newTab) => {
  if (newTab === "list") {
    router.replace({ query: { tab: "list" } });
  } else {
    router.replace({ query: {} });
  }
});

async function loadGeneratedScripts() {
  try {
    generatedScripts.value = await getScripts();
  } catch (error) {
    console.error("台本データの読み込みに失敗しました:", error);
  }
}

async function loadProjects() {
  try {
    projects.value = await getProjects();
  } catch (error) {
    console.error("プロジェクトデータの読み込みに失敗しました:", error);
  }
}

async function onSave() {
  error.value = "";
  if (!form.title || !form.description || !form.projectId) {
    error.value = "タイトル、説明、プロジェクトをすべて入力してください。";
    return;
  }

  loading.value = true;

  try {
    // 選択されたプロジェクト情報を取得
    const selectedProject = projects.value.find(
      (p) => String(p.id) === String(form.projectId)
    );

    // 新しい台本を作成
    const scriptData = {
      title: form.title,
      description: form.description,
      projectId: form.projectId,
      projectName: selectedProject ? selectedProject.name : null,
      status: "draft",
    };

    const result = await createScript(scriptData);

    // リストを更新
    await loadGeneratedScripts();

    // フォームをリセット
    form.title = "";
    form.description = "";
    form.projectId = "";

    // 作成した台本の詳細画面に移動
    router.push(`/script/${result.index}`);
  } catch (error) {
    console.error("台本の作成に失敗しました:", error);
    error.value = "台本の作成に失敗しました";
  } finally {
    loading.value = false;
  }
}

async function deleteScriptItem(index) {
  if (confirm("本当に削除しますか？")) {
    try {
      await deleteScript(index);
      await loadGeneratedScripts();
    } catch (error) {
      console.error("台本の削除に失敗しました:", error);
      alert("台本の削除に失敗しました");
    }
  }
}

function previewScript(index) {
  // プレビュー機能は今後実装
  console.log("Preview script:", generatedScripts.value[index]);
}

function goToDetail(index) {
  router.push(`/script/${index}`);
}
</script>
