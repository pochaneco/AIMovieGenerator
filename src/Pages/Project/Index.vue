<template>
  <BaseLayout>
    <PageContainer max-width="3xl">
      <!-- プロジェクトが存在する場合の通常表示 -->
      <div v-if="projects.length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">{{ $t("projectSettings") }}</h2>
          <CoolButton variant="primary" @click="createProject">
            <span class="hidden sm:inline">{{ $t("add") }}</span>
            <Icon name="plus" class="sm:ml-2 inline" />
          </CoolButton>
        </div>
        <ProjectList
          :projects="projects"
          @edit="editProject"
          @delete="deleteProjectItem"
        />
      </div>

      <!-- プロジェクトが存在しない場合の表示 -->
      <NoProjectsMessage
        v-else
        :title="$t('noProjectsManagementTitle')"
        :message="$t('noProjectsManagementMessage')"
        :button-text="$t('createFirstProject')"
        @create-project="createProject"
      />
    </PageContainer>
  </BaseLayout>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import PageContainer from "@/components/PageContainer.vue";
import ProjectList from "./Partials/ProjectList.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import NoProjectsMessage from "@/components/NoProjectsMessage.vue";
import { getProjects, deleteProject } from "@/services/dataService.js";

const projects = ref([]);
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

function createProject() {
  router.push({ name: "ProjectNew" });
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
</script>
