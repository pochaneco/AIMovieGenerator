<template>
  <div v-if="project" class="mb-4 p-4 bg-gray-50 rounded border">
    <h4 class="font-medium text-sm text-gray-700 mb-2">
      {{ $t("projectDescription") }}
    </h4>
    <p class="text-gray-600 text-sm mb-3">
      {{ project.description }}
    </p>

    <div v-if="project.characters && project.characters.length > 0">
      <h5 class="font-medium text-sm text-gray-700 mb-2">
        {{ $t("characterList") }}
      </h5>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="character in project.characters"
          :key="character.name"
          class="inline-flex items-center px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full"
        >
          {{ character.name }}
          <span v-if="character.role" class="ml-1 text-sky-600">
            ({{ character.role }})
          </span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    default: null,
  },
});
</script>
