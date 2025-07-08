<template>
  <button
    @click="$emit('click')"
    :class="buttonClasses"
    class="w-full px-4 py-3 rounded-md text-sm transition-all opacity-60 hover:opacity-100 border border-dashed cursor-pointer"
  >
    + {{ text }}
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  text: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "success", "info"].includes(value),
  },
});

const emit = defineEmits(["click"]);

const buttonClasses = computed(() => {
  const variants = {
    primary:
      "bg-sky-50 text-sky-600 hover:bg-sky-100 hover:text-sky-700 border-sky-200 hover:border-sky-300",
    secondary:
      "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-700 border-gray-200 hover:border-gray-300",
    success:
      "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border-green-200 hover:border-green-300",
    info: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:text-cyan-700 border-cyan-200 hover:border-cyan-300",
  };

  return variants[props.variant] || variants.primary;
});
</script>
