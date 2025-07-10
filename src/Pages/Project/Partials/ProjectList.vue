<template>
  <div>
    <h3 class="text-lg font-bold mb-2">{{ $t("projectList") }}</h3>
    <EntityList
      :items="projects"
      :actions="projectActions"
      :empty-icon="'folder'"
      :empty-message="$t('noProjectsYet')"
      :empty-button-text="$t('createFirstProject')"
      @createNew="$emit('createNew')"
      @action="handleAction"
    >
      <!-- プロジェクトタイトル -->
      <template #item-title="{ item }">
        <div class="font-semibold">{{ item.name }}</div>
      </template>

      <!-- プロジェクト内容 -->
      <template #item-content="{ item }">
        <div class="text-gray-600 text-sm">{{ item.description }}</div>
      </template>
    </EntityList>
  </div>
</template>

<script setup>
import EntityList from "@/components/EntityList.vue";
import { STANDARD_ACTIONS } from "@/utils/actionDefinitions.js";
import { useRouter } from "vue-router";

const props = defineProps({
  projects: Array,
});

const emit = defineEmits(["delete", "createNew"]);
const router = useRouter();

// プロジェクト用のアクション定義
const projectActions = [STANDARD_ACTIONS.edit, STANDARD_ACTIONS.delete];

function handleAction({ action, item, index }) {
  switch (action) {
    case "edit":
      router.push({ name: "ProjectEdit", query: { id: item.id } });
      break;
    case "delete":
      emit("delete", index);
      break;
  }
}
</script>
