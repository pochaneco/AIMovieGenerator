<template>
  <BaseLayout>
    <PageContainer>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">
          {{ $t("add") }} {{ $t("characterName") }}
        </h2>
        <CoolButton variant="secondary" @click="onCancel">
          <Icon name="arrow-left" class="mr-2" />
          {{ $t("back") }}
        </CoolButton>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <div class="mb-4 p-4 bg-sky-50 rounded-lg">
          <h3 class="font-medium text-sky-900 mb-1">
            {{ $t("projectSettings") }}
          </h3>
          <p class="text-sky-700 text-sm">{{ project?.name }}</p>
        </div>

        <CharacterForm
          :form="characterForm"
          :editIndex="null"
          @submit="onSubmit"
          @cancel="onCancel"
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
import CharacterForm from "./Partials/CharacterForm.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import { getProject, updateProject } from "@/services/dataService.js";

const router = useRouter();
const route = useRoute();
const projectId = route.params.id;
const project = ref(null);
const characterForm = reactive({ name: "", role: "" });

onMounted(async () => {
  try {
    const found = await getProject(projectId);
    if (found) {
      project.value = found;
    } else {
      router.replace({ name: "ProjectIndex" });
    }
  } catch (error) {
    console.error("プロジェクトの読み込みに失敗しました:", error);
    router.replace({ name: "ProjectIndex" });
  }
});

async function onSubmit() {
  if (!characterForm.name) return;

  try {
    const characters = project.value.characters || [];
    characters.push({
      name: characterForm.name,
      role: characterForm.role,
    });

    await updateProject(projectId, {
      characters: characters,
    });

    router.push({ name: "ProjectEdit", query: { id: projectId } });
  } catch (error) {
    console.error("キャラクターの作成に失敗しました:", error);
    alert("キャラクターの作成に失敗しました");
  }
}

function onCancel() {
  router.push({ name: "ProjectEdit", query: { id: projectId } });
}
</script>
