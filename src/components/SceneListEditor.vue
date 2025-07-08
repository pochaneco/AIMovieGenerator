<template>
  <div class="my-4 flex flex-col gap-2">
    <div class="flex gap-2">
      <CoolButton variant="primary" @click="$emit('add')"
        >シーン追加</CoolButton
      >
    </div>
    <ul>
      <li
        v-for="(scene, idx) in scenes"
        :key="scene.id"
        class="flex items-center gap-2 py-1"
      >
        <span
          class="flex-1 cursor-pointer hover:underline"
          @click="$emit('edit', idx)"
          >{{ scene.title || `シーン${idx + 1}` }}</span
        >
        <button
          @click="$emit('move', idx, idx - 1)"
          :disabled="idx === 0"
          class="px-2 py-1 text-gray-500 hover:text-sky-600 disabled:opacity-30"
        >
          ↑
        </button>
        <button
          @click="$emit('move', idx, idx + 1)"
          :disabled="idx === scenes.length - 1"
          class="px-2 py-1 text-gray-500 hover:text-sky-600 disabled:opacity-30"
        >
          ↓
        </button>
      </li>
    </ul>
  </div>
</template>
<script setup>
import CoolButton from "./CoolButton.vue";
const props = defineProps({
  scenes: {
    type: Array,
    required: true,
  },
});
</script>
