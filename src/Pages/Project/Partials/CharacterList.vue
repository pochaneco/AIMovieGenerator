<template>
  <div>
    <h3 class="text-lg font-bold mb-2">{{ $t("characterList") }}</h3>
    <ul class="mt-2">
      <li
        v-for="(char, cidx) in characters"
        :key="cidx"
        class="mb-1 flex items-center justify-between"
      >
        <div>
          <span class="font-semibold">{{ char.name }}</span>
          <span class="text-gray-500 ml-2">{{ char.role }}</span>
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
