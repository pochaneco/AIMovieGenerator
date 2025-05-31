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
        @delete="deleteProject"
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
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ProjectForm from "./Partials/ProjectForm.vue";
import ProjectList from "./Partials/ProjectList.vue";
import CoolButton from "@/components/CoolButton.vue";
import ProjectModal from "./Partials/ProjectModal.vue";

const LS_KEY = "aimovie_projects";
const projects = ref([]);
const projectForm = reactive({ name: "", description: "" });
const editIndex = ref(null);
const openModal = ref(false);
const router = useRouter();

function loadProjects() {
  const data = localStorage.getItem(LS_KEY);
  projects.value = data ? JSON.parse(data) : [];
}
function saveProjects() {
  localStorage.setItem(LS_KEY, JSON.stringify(projects.value));
}
function resetForm() {
  projectForm.name = "";
  projectForm.description = "";
  editIndex.value = null;
}
function saveProject() {
  if (!projectForm.name) return;
  if (editIndex.value === null) {
    projects.value.push({
      id: Date.now(),
      name: projectForm.name,
      description: projectForm.description,
      characters: [],
    });
  } else {
    Object.assign(projects.value[editIndex.value], {
      name: projectForm.name,
      description: projectForm.description,
    });
  }
  saveProjects();
  resetForm();
}
function editProject(idx) {
  const id = projects.value[idx].id;
  router.push({ name: "ProjectEdit", query: { id } });
}
function deleteProject(idx) {
  if (confirm("本当に削除しますか？")) {
    projects.value.splice(idx, 1);
    saveProjects();
    if (selectedIdx.value === idx) selectedIdx.value = null;
  }
}
function closeModal() {
  openModal.value = false;
  resetForm();
}
function onModalSubmit() {
  saveProject();
  openModal.value = false;
}

watch(projects, saveProjects, { deep: true });

loadProjects();
</script>
