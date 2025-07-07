<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 class="text-2xl font-bold mb-4">
        {{ $t("edit") }} {{ $t("projectSettings") }}
      </h2>

      <!-- タブナビゲーション -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'project'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'project'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ $t("projectSettings") }}
          </button>
          <button
            @click="activeTab = 'characters'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'characters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            {{ $t("characterList") }}
          </button>
        </nav>
      </div>

      <!-- プロジェクト設定タブ -->
      <div v-show="activeTab === 'project'">
        <ProjectForm
          :form="projectForm"
          :editIndex="0"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </div>

      <!-- キャラクター一覧タブ -->
      <div v-show="activeTab === 'characters'">
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
import {
  getProjects,
  getProject,
  updateProject,
} from "@/services/dataService.js";

const router = useRouter();
const route = useRoute();
const projectForm = reactive({ name: "", description: "" });
const characterForm = reactive({ name: "", role: "" });
const charEditIndex = ref(null);
const openCharModal = ref(false);
const activeTab = ref("project"); // デフォルトはプロジェクト設定タブ
const projectId = route.query.id;
const project = ref(null);

onMounted(async () => {
  try {
    const found = await getProject(projectId);
    if (found) {
      project.value = found;
      projectForm.name = found.name;
      projectForm.description = found.description;
    } else {
      router.replace({ name: "ProjectIndex" });
    }
  } catch (error) {
    console.error("プロジェクトの読み込みに失敗しました:", error);
    router.replace({ name: "ProjectIndex" });
  }
});

async function onSubmit() {
  try {
    await updateProject(projectId, {
      name: projectForm.name,
      description: projectForm.description,
      characters: project.value.characters || [],
    });
    router.push({ name: "ProjectIndex" });
  } catch (error) {
    console.error("プロジェクトの更新に失敗しました:", error);
    alert("プロジェクトの更新に失敗しました");
  }
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
async function updateProjectCharacters() {
  try {
    await updateProject(projectId, {
      characters: project.value.characters || [],
    });
  } catch (error) {
    console.error("キャラクターの更新に失敗しました:", error);
  }
}
function cancelCharEdit() {
  charEditIndex.value = null;
  characterForm.name = "";
  characterForm.role = "";
}
</script>
