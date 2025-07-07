<template>
  <div>
    <h3 class="text-lg font-bold mb-2">{{ $t("characterList") }}</h3>
    <ul class="mt-2 divide-y divide-gray-200">
      <li
        v-for="(char, cidx) in characters"
        :key="cidx"
        class="mb-1 pb-2 flex items-center justify-between mt-2"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold">{{ char.name }}</span>
            <span class="text-gray-500 truncate max-w-xs">{{ char.role }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <CoolButton
            color="primary"
            @click="$emit('edit', cidx)"
            :aria-label="'編集'"
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
            @click="$emit('delete', cidx)"
            :aria-label="'削除'"
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
const props = defineProps({
  characters: Array,
});
const emit = defineEmits(["edit", "delete"]);
</script>
