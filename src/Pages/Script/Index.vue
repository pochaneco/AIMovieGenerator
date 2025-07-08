<template>
  <BaseLayout>
    <PageContainer>
      <h2 class="text-2xl font-bold mb-4">{{ $t("generateMovie") }}</h2>

      <!-- プロジェクトがない場合のメッセージ -->
      <div v-if="projects.length === 0">
        <NoProjectsMessage
          :sub-message="$t('projectRequiredForScript')"
          @create-project="goToProjectCreate"
        />
      </div>

      <!-- プロジェクトがある場合のタブコンポーネント -->
      <Tabs
        v-else
        v-model="activeTab"
        :tabs="tabItems"
        @tab-change="onTabChange"
      >
        <template #default="{ activeTab }">
          <!-- 新規作成タブ -->
          <div v-if="activeTab === 'create'">
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
          <div v-else-if="activeTab === 'list'">
            <ScriptList
              :videos="generatedScripts"
              @delete="deleteScriptItem"
              @preview="previewScript"
              @detail="goToDetail"
              @createNew="switchToCreateTab"
            />
          </div>
        </template>
      </Tabs>
    </PageContainer>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import PageContainer from "@/components/PageContainer.vue";
import Tabs from "@/components/Tabs.vue";
import ScriptGenerateForm from "./Partials/ScriptGenerateForm.vue";
import ScriptList from "./Partials/ScriptList.vue";
import NoProjectsMessage from "@/components/NoProjectsMessage.vue";
import {
  getScripts,
  createScript,
  getProjects,
  deleteScript,
} from "@/services/dataService.js";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// タブ設定
const tabItems = computed(() => [
  { id: "create", label: t("newCreate") },
  { id: "list", label: t("createdList") },
]);

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

// タブ変更ハンドラー
function onTabChange(tabId) {
  // watchで自動的にクエリパラメータが更新される
}

// 新規作成タブに切り替え
function switchToCreateTab() {
  activeTab.value = "create";
}

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

function goToProjectCreate() {
  router.push("/project");
}
</script>
