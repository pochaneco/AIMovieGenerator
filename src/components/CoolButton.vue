<template>
  <button
    :type="type"
    :class="[
      'transition duration-150 ease-in-out font-semibold px-4 py-2 rounded shadow',
      color === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' : '',
      color === 'secondary' ? 'bg-gray-400 text-white hover:bg-gray-500' : '',
      color === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : '',
      color === 'success' ? 'bg-green-500 text-white hover:bg-green-600' : '',
      customClass,
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  type: { type: String, default: "button" },
  color: { type: String, default: "primary" }, // primary, secondary, danger, success
  customClass: { type: String, default: "" },
});
const emit = defineEmits(["click"]);
</script>
