<template>
  <svg
    :class="['inline-block', sizeClass]"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path :d="iconPath" />
  </svg>
</template>

<script setup>
import { computed } from "vue";
import {
  mdiArrowLeft,
  mdiLoading,
  mdiAlert,
  mdiFileDocument,
  mdiFlash,
  mdiPencil,
  mdiCheck,
  mdiClose,
  mdiInformation,
  mdiStop,
  mdiTrashCan,
  mdiPlus,
  mdiEye,
  mdiPlay,
  mdiVideo,
  mdiCalendar,
  mdiFolder,
  mdiChevronDown,
  mdiChevronRight,
  mdiChat,
  mdiDownload,
  mdiDelete,
  mdiSend,
} from "@mdi/js";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
  },
});

const iconMap = {
  back: mdiArrowLeft,
  loading: mdiLoading,
  error: mdiAlert,
  document: mdiFileDocument,
  lightning: mdiFlash,
  edit: mdiPencil,
  pencil: mdiPencil,
  check: mdiCheck,
  close: mdiClose,
  info: mdiInformation,
  stop: mdiStop,
  trash: mdiTrashCan,
  plus: mdiPlus,
  eye: mdiEye,
  play: mdiPlay,
  video: mdiVideo,
  calendar: mdiCalendar,
  folder: mdiFolder,
  "chevron-down": mdiChevronDown,
  "chevron-right": mdiChevronRight,
  chat: mdiChat,
  download: mdiDownload,
  delete: mdiDelete,
  send: mdiSend,
};

const iconPath = computed(() => {
  return iconMap[props.name] || mdiAlert; // デフォルトはアラートアイコン
});

const sizeClass = computed(() => {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-12 h-12",
  };
  return sizes[props.size] || sizes.md;
});
</script>
