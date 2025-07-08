<template>
  <span>{{ formattedDate }}</span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  date: {
    type: [String, Date],
    default: null,
  },
  format: {
    type: String,
    default: "full", // "full", "date", "time", "relative"
  },
  fallback: {
    type: String,
    default: "日時不明",
  },
});

const formattedDate = computed(() => {
  if (!props.date) return props.fallback;

  const date = new Date(props.date);
  if (isNaN(date.getTime())) return props.fallback;

  const options = {
    full: {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
    date: {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
    time: {
      hour: "2-digit",
      minute: "2-digit",
    },
    relative: null, // 相対時間は別途実装
  };

  if (props.format === "relative") {
    return getRelativeTime(date);
  }

  return date.toLocaleDateString(
    "ja-JP",
    options[props.format] || options.full
  );
});

function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;

  return date.toLocaleDateString("ja-JP");
}
</script>
