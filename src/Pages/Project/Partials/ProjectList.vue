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
            variant="primary"
            @click="goEdit(project.id)"
            :aria-label="$t('edit')"
          >
            <Icon name="pencil" />
          </CoolButton>
          <CoolButton
            variant="danger"
            @click="$emit('delete', idx)"
            :aria-label="$t('delete')"
          >
            <Icon name="trash" />
          </CoolButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";
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
