<template>
  <BaseLayout>
    <div class="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 class="text-2xl font-bold mb-4">
        {{ $t("edit") }} {{ $t("projectSettings") }}
      </h2>
      <ProjectForm
        :form="projectForm"
        :editIndex="0"
        @submit="onSubmit"
        @cancel="onCancel"
      />
      <div class="mt-10 border-t pt-6">
        <CoolButton color="primary" class="mb-4" @click="openCharModal = true">
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
        <CharacterList
          :characters="project?.characters"
          @edit="editCharacter"
          @delete="deleteCharacter"
        />
        <CharacterModal
          :show="openCharModal"
          :form="characterForm"
          :editIndex="charEditIndex"
          @close="closeCharModal"
          @submit="onCharModalSubmit"
        />
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import ProjectForm from "./Partials/ProjectForm.vue";
import CharacterForm from "./Partials/CharacterForm.vue";
import CharacterList from "./Partials/CharacterList.vue";
import CharacterModal from "./Partials/CharacterModal.vue";
import CoolButton from "@/components/CoolButton.vue";

const router = useRouter();
const route = useRoute();
const LS_KEY = "aimovie_projects";
const projectForm = reactive({ name: "", description: "" });
const characterForm = reactive({ name: "", role: "" });
const charEditIndex = ref(null);
const openCharModal = ref(false);
const projectId = route.query.id;
const project = ref(null);

onMounted(() => {
  const data = localStorage.getItem(LS_KEY);
  const projects = data ? JSON.parse(data) : [];
  const found = projects.find((p) => String(p.id) === String(projectId));
  if (found) {
    project.value = found;
    projectForm.name = found.name;
    projectForm.description = found.description;
  } else {
    router.replace({ name: "ProjectIndex" });
  }
});

function onSubmit() {
  const data = localStorage.getItem(LS_KEY);
  const projects = data ? JSON.parse(data) : [];
  const idx = projects.findIndex((p) => String(p.id) === String(projectId));
  if (idx !== -1) {
    projects[idx].name = projectForm.name;
    projects[idx].description = projectForm.description;
    projects[idx].characters = project.value.characters || [];
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  }
  router.push({ name: "ProjectIndex" });
}
function onCancel() {
  router.push({ name: "ProjectIndex" });
}
function onCharModalSubmit() {
  saveCharacter();
  openCharModal.value = false;
}
function closeCharModal() {
  openCharModal.value = false;
  cancelCharEdit();
}
function saveCharacter() {
  if (!characterForm.name) return;
  if (!project.value.characters) project.value.characters = [];
  if (charEditIndex.value === null) {
    project.value.characters.push({
      name: characterForm.name,
      role: characterForm.role,
    });
  } else {
    Object.assign(project.value.characters[charEditIndex.value], {
      name: characterForm.name,
      role: characterForm.role,
    });
  }
  // projects配列に反映して保存
  updateProjectCharacters();
  cancelCharEdit();
}
function editCharacter(cidx) {
  charEditIndex.value = cidx;
  Object.assign(characterForm, project.value.characters[cidx]);
  openCharModal.value = true;
}
function deleteCharacter(cidx) {
  if (confirm("本当に削除しますか？")) {
    project.value.characters.splice(cidx, 1);
    updateProjectCharacters();
  }
}
function updateProjectCharacters() {
  const data = localStorage.getItem(LS_KEY);
  const projects = data ? JSON.parse(data) : [];
  const idx = projects.findIndex((p) => String(p.id) === String(projectId));
  if (idx !== -1) {
    projects[idx].characters = project.value.characters || [];
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  }
}
function cancelCharEdit() {
  charEditIndex.value = null;
  characterForm.name = "";
  characterForm.role = "";
}
function getAllProjects() {
  const data = localStorage.getItem(LS_KEY);
  return data ? JSON.parse(data) : [];
}
</script>
