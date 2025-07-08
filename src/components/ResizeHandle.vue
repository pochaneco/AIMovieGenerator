<template>
  <div
    ref="resizeHandle"
    @mousedown="handleMouseDown"
    class="absolute top-0 left-0 w-1 h-full cursor-ew-resize bg-gray-300 hover:bg-sky-500 transition-colors z-10"
    :title="$t('resizeWidth')"
  ></div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const emit = defineEmits(["startResize"]);

function handleMouseDown(event) {
  emit("startResize", event);
}
</script>
