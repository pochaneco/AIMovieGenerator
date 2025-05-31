<template>
  <div>
    <h3 class="text-lg font-bold mb-2">{{ $t("projectList") }}</h3>
    <ul>
      <li
        v-for="(project, idx) in projects"
        :key="project.id"
        class="mb-2 p-2 border rounded flex items-center justify-between"
      >
        <div>
          <div class="font-semibold">{{ project.name }}</div>
          <div class="text-gray-600 text-sm">{{ project.description }}</div>
        </div>
        <div class="flex gap-2">
          <CoolButton
            color="primary"
            @click="goEdit(project.id)"
            :aria-label="$t('edit')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path :d="mdiPencil" fill="currentColor" />
            </svg>
          </CoolButton>
          <CoolButton
            color="danger"
            @click="$emit('delete', idx)"
            :aria-label="$t('delete')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5"
              viewBox="0 0 24 24"
            >
              <path :d="mdiTrashCan" fill="currentColor" />
            </svg>
          </CoolButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
import { useRouter } from "vue-router";
const props = defineProps({
  projects: Array,
});
const router = useRouter();
function goEdit(id) {
  router.push({ name: "ProjectEdit", query: { id } });
}
const emit = defineEmits(["delete"]);
</script>
