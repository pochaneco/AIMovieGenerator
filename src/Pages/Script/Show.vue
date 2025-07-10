<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto">
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

    <!-- 基本情報編集モーダル -->
    <Modal
      v-model:show="showEditModal"
      :title="$t('editBasicInfo')"
      size="2xl"
      @close="closeEditModal"
    >
      <ScriptGenerateForm
        :form="editForm"
        :projects="projects"
        @update:title="editForm.title = $event"
        @update:description="editForm.description = $event"
        @update:projectId="editForm.projectId = $event"
        @submit="saveBasicInfo"
      >
        <template #submit-button>
          <div class="flex gap-4 justify-end mt-6">
            <CoolButton
              @click="duplicateScript"
              variant="warning"
              class="flex items-center gap-2 px-6 py-2"
            >
              <Icon name="copy" size="sm" />
              {{ $t("duplicate") }}
            </CoolButton>
            <CoolButton
              @click="closeEditModal"
              variant="secondary"
              class="px-4 py-2"
            >
              {{ $t("cancel") }}
            </CoolButton>
            <CoolButton
              type="submit"
              :disabled="!editForm.title || !editForm.description"
              variant="primary"
              class="px-4 py-2"
            >
              {{ $t("save") }}
            </CoolButton>
          </div>
        </template>
      </ScriptGenerateForm>
    </Modal>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ScriptDetail from "./Partials/ScriptDetail.vue";
import ScriptGenerateForm from "./Partials/ScriptGenerateForm.vue";
import Modal from "@/components/Modal.vue";
import CoolButton from "@/components/CoolButton.vue";
import {
  generateAIScript,
  handleGenerationError,
} from "@/utils/scriptGenerator.js";
import {
  getScript,
  updateScript,
  getProject,
  getProjects,
  addScript,
  getMaxScriptId,
} from "@/services/dataService.js";
import { duplicateScript as duplicateScriptUtil } from "@/utils/scriptGenerator.js";

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
const projects = ref([]);
const isGenerating = ref(false);
const showEditModal = ref(false);
const editForm = ref({
  title: "",
  description: "",
  projectId: "",
});

onMounted(() => {
  loadScript();
  loadProjects();
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

async function loadProjects() {
  try {
    projects.value = await getProjects();
  } catch (error) {
    console.error("プロジェクトの読み込みに失敗しました:", error);
  }
}

function goBack() {
  router.push("/generate");
}

function goBackToList() {
  router.push("/generate?tab=list");
}

async function generateScript() {
  // 台本生成は Edit.vue に遷移
  router.push(`/script/${route.params.id}/edit`);
}

async function regenerateScript() {
  if (isGenerating.value) return;

  const confirmed = confirm(
    "台本を再生成しますか？現在の内容は上書きされます。"
  );
  if (!confirmed) return;

  // 台本再生成も Edit.vue に遷移
  router.push(`/script/${route.params.id}/edit`);
}

function editScript() {
  // 基本情報編集の場合はモーダルを表示
  if (
    (!script.value.content && !script.value.structuredContent) ||
    script.value.status === "draft"
  ) {
    showEditBasicInfo();
  } else {
    // 台本が既にある場合は Edit.vue に遷移
    router.push(`/script/${route.params.id}/edit`);
  }
}

function showEditBasicInfo() {
  editForm.value = {
    title: script.value.title || "",
    description: script.value.description || "",
    projectId: script.value.projectId || "",
  };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

async function saveBasicInfo() {
  try {
    const scriptIndex = parseInt(route.params.id);

    // プロジェクト名を取得
    let projectName = "";
    if (editForm.value.projectId) {
      const selectedProject = projects.value.find(
        (p) => String(p.id) === String(editForm.value.projectId)
      );
      projectName = selectedProject?.name || "";
    }

    const updatedScript = {
      ...script.value,
      title: editForm.value.title,
      description: editForm.value.description,
      projectId: editForm.value.projectId,
      projectName: projectName,
      updatedAt: new Date().toISOString(),
    };

    await updateScript(scriptIndex, updatedScript);
    script.value = updatedScript;

    // プロジェクト詳細も再読み込み
    await loadProject();

    closeEditModal();
  } catch (error) {
    console.error("基本情報の保存に失敗しました:", error);
    alert("基本情報の保存に失敗しました");
  }
}

async function updateScriptData() {
  try {
    const scriptIndex = parseInt(route.params.id);
    await updateScript(scriptIndex, script.value);
  } catch (error) {
    console.error("台本の更新に失敗しました:", error);
  }
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
