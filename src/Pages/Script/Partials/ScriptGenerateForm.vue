<template>
  <div>
    <p class="mb-6 text-gray-600">
      {{ $t("generateDescription") }}
    </p>
    <form @submit.prevent="$emit('submit')">
      <div class="mb-4">
        <label class="block mb-1 font-medium">
          {{ $t("projectSettings") }}<span class="text-red-500 ml-1">*</span>
        </label>
        <select
          :value="form.projectId"
          @change="$emit('update:projectId', $event.target.value)"
          class="w-full border rounded px-3 py-2 bg-white"
          required
        >
          <option value="">{{ $t("selectProject") }}</option>
          <option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <!-- 選択したプロジェクトの説明を表示 -->
      <div v-if="selectedProject" class="mb-4 p-4 bg-gray-50 rounded border">
        <h4 class="font-medium text-sm text-gray-700 mb-2">
          {{ $t("projectDescription") }}
        </h4>
        <p class="text-gray-600 text-sm mb-3">
          {{ selectedProject.description }}
        </p>

        <div
          v-if="
            selectedProject.characters && selectedProject.characters.length > 0
          "
        >
          <h5 class="font-medium text-sm text-gray-700 mb-2">
            {{ $t("characterList") }}
          </h5>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="character in selectedProject.characters"
              :key="character.name"
              class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
            >
              {{ character.name }}
            </span>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">
          {{ $t("videoTitle") }}<span class="text-red-500 ml-1">*</span>
        </label>
        <input
          :value="form.title"
          @input="$emit('update:title', $event.target.value)"
          type="text"
          class="w-full border rounded px-3 py-2"
          :placeholder="$t('videoTitlePlaceholder')"
          required
        />
      </div>
      <div class="mb-6">
        <label class="block mb-1 font-medium">
          {{ $t("description") }}<span class="text-red-500 ml-1">*</span>
        </label>
        <textarea
          :value="form.description"
          @input="$emit('update:description', $event.target.value)"
          class="w-full border rounded px-3 py-2"
          rows="3"
          :placeholder="$t('descriptionPlaceholder')"
          required
        ></textarea>
      </div>
      <button
        type="submit"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="loading"
      >
        {{ loading ? $t("saving") : $t("save") }}
      </button>
    </form>
    <div v-if="loading" class="mt-4 text-blue-600">{{ $t("saving") }}...</div>
    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  form: Object,
  loading: Boolean,
  error: String,
  projects: Array,
});

const emit = defineEmits([
  "submit",
  "update:title",
  "update:description",
  "update:projectId",
]);

// 選択されたプロジェクトを算出
const selectedProject = computed(() => {
  if (!props.form.projectId || !props.projects) return null;
  return props.projects.find(
    (p) => String(p.id) === String(props.form.projectId)
  );
});
</script>
