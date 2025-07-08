<template>
  <BaseLayout>
    <PageContainer>
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
        <CoolButton variant="primary" class="mb-4" @click="createCharacter">
          <span class="hidden sm:inline">{{ $t("add") }}</span>
          <Icon name="plus" class="sm:ml-2 inline" />
        </CoolButton>
        <CharacterList
          :characters="project?.characters"
          @edit="editCharacter"
          @delete="deleteCharacter"
        />
      </div>
    </PageContainer>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import PageContainer from "@/components/PageContainer.vue";
import ProjectForm from "./Partials/ProjectForm.vue";
import CharacterList from "./Partials/CharacterList.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import { getProject, updateProject } from "@/services/dataService.js";

const router = useRouter();
const route = useRoute();
const projectForm = reactive({ name: "", description: "" });
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
    // データをクリーンアップしてからupdateProjectに送信
    const cleanProjectData = {
      name: projectForm.name,
      description: projectForm.description,
      characters: project.value.characters || [],
    };

    // シリアライズ可能かテスト
    const serializedData = JSON.parse(JSON.stringify(cleanProjectData));

    await updateProject(projectId, serializedData);
    router.push({ name: "ProjectIndex" });
  } catch (error) {
    console.error("プロジェクトの更新に失敗しました:", error);
    alert("プロジェクトの更新に失敗しました");
  }
}
function onCancel() {
  router.push({ name: "ProjectIndex" });
}

function createCharacter() {
  router.push({ name: "CharacterNew", params: { id: projectId } });
}

function editCharacter(cidx) {
  router.push({
    name: "CharacterEdit",
    params: { id: projectId, characterIndex: cidx },
  });
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
    // プロジェクト情報を再読み込みして最新状態に同期
    const updated = await getProject(projectId);
    if (updated) {
      project.value = updated;
    }
  } catch (error) {
    console.error("キャラクターの更新に失敗しました:", error);
  }
}
</script>
