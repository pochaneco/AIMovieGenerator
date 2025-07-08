<template>
  <BaseLayout>
    <PageContainer>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">
          {{ $t("add") }} {{ $t("projectSettings") }}
        </h2>
        <CoolButton variant="secondary" @click="onCancel">
          <Icon name="arrow-left" class="mr-2" />
          {{ $t("back") }}
        </CoolButton>
      </div>

      <div class="bg-white shadow-sm rounded-lg p-6">
        <ProjectForm
          :form="projectForm"
          :editIndex="null"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </div>
    </PageContainer>
  </BaseLayout>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import BaseLayout from "@/Layouts/BaseLayout.vue";
import PageContainer from "@/components/PageContainer.vue";
import ProjectForm from "./Partials/ProjectForm.vue";
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
import { createProject } from "@/services/dataService.js";

const router = useRouter();
const projectForm = reactive({ name: "", description: "" });

async function onSubmit() {
  if (!projectForm.name) return;

  try {
    await createProject({
      name: projectForm.name,
      description: projectForm.description,
      characters: [],
    });
    router.push({ name: "ProjectIndex" });
  } catch (error) {
    console.error("プロジェクトの作成に失敗しました:", error);
    alert("プロジェクトの作成に失敗しました");
  }
}

function onCancel() {
  router.push({ name: "ProjectIndex" });
}
</script>
