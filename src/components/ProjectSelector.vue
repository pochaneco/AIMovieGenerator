<template>
  <div class="mb-4">
    <label class="block mb-1 font-medium">
      {{ $t("projectSettings") }}<span class="text-red-500 ml-1">*</span>
    </label>
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors"
      :class="{ 'border-red-500': error }"
      required
    >
      <option value="">{{ $t("selectProject") }}</option>
      <option v-for="project in projects" :key="project.id" :value="project.id">
        {{ project.name }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  projects: {
    type: Array,
    default: () => [],
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue"]);
</script>
