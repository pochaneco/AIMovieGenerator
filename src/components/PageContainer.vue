<template>
  <div
    :class="[
      'mx-auto bg-white rounded shadow',
      maxWidthClass,
      `p-${padding}`,
      marginClass,
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  maxWidth: {
    type: String,
    default: "4xl",
  },
  padding: {
    type: String,
    default: "6",
  },
  marginTop: {
    type: String,
    default: "8",
  },
  marginBottom: {
    type: String,
    default: "0",
  },
});

const maxWidthClass = computed(() => {
  return props.maxWidth === "none" ? "max-w-none" : `max-w-${props.maxWidth}`;
});

const marginClass = computed(() => {
  const classes = [];
  if (props.marginTop !== "0") {
    classes.push(`mt-${props.marginTop}`);
  }
  if (props.marginBottom !== "0") {
    classes.push(`mb-${props.marginBottom}`);
  }
  return classes.join(" ");
});
</script>
