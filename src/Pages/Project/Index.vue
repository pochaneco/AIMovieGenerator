<template>
  <BaseLayout>
    <div class="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">{{ $t("projectSettings") }}</h2>
        <CoolButton color="primary" @click="openModal = true">
          <span class="hidden sm:inline">{{ $t("add") }}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 sm:ml-2 inline"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z"
            />
          </svg>
        </CoolButton>
      </div>
      <ProjectList
        :projects="projects"
        @edit="editProject"
        @delete="deleteProjectItem"
      />
      <ProjectModal
        :show="openModal"
        :form="projectForm"
        :editIndex="editIndex"
        @close="closeModal"
        @submit="onModalSubmit"
      />
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ProjectForm from "./Partials/ProjectForm.vue";
import ProjectList from "./Partials/ProjectList.vue";
import CoolButton from "@/components/CoolButton.vue";
import ProjectModal from "./Partials/ProjectModal.vue";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/services/dataService.js";

const projects = ref([]);
const projectForm = reactive({ name: "", description: "" });
const editIndex = ref(null);
const openModal = ref(false);
const router = useRouter();

onMounted(() => {
  loadProjects();
});

async function loadProjects() {
  try {
    projects.value = await getProjects();
  } catch (error) {
    console.error("プロジェクトの読み込みに失敗しました:", error);
  }
}

function resetForm() {
  projectForm.name = "";
  projectForm.description = "";
  editIndex.value = null;
}

async function saveProject() {
  if (!projectForm.name) return;

  try {
    if (editIndex.value === null) {
      // 新規作成
      await createProject({
        name: projectForm.name,
        description: projectForm.description,
        characters: [],
      });
    } else {
      // 更新（Note: Index画面では編集はしないが、将来の拡張のため）
      const project = projects.value[editIndex.value];
      await updateProject(project.id, {
        name: projectForm.name,
        description: projectForm.description,
      });
    }
    await loadProjects();
    resetForm();
  } catch (error) {
    console.error("プロジェクトの保存に失敗しました:", error);
    alert("プロジェクトの保存に失敗しました");
  }
}
function editProject(idx) {
  const id = projects.value[idx].id;
  router.push({ name: "ProjectEdit", query: { id } });
}

async function deleteProjectItem(idx) {
  if (confirm("本当に削除しますか？")) {
    try {
      const project = projects.value[idx];
      await deleteProject(project.id);
      await loadProjects();
    } catch (error) {
      console.error("プロジェクトの削除に失敗しました:", error);
      alert("プロジェクトの削除に失敗しました");
    }
  }
}

function closeModal() {
  openModal.value = false;
  resetForm();
}

async function onModalSubmit() {
  await saveProject();
  openModal.value = false;
}
</script>
