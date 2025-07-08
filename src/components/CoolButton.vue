<template>
  <button
    :type="type"
    :class="[
      'transition duration-150 ease-in-out font-semibold rounded shadow cursor-pointer',
      variantClasses,
      sizeClasses,
      customClass,
    ]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "danger", "success", "info", "warning"].includes(
        value
      ),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["xs", "sm", "md", "lg"].includes(value),
  },
  customClass: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click"]);

// バリアント（色）のクラス
const variantClasses = computed(() => {
  const variants = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-pink-500 text-white hover:bg-pink-600",
    success: "bg-green-500 text-white hover:bg-green-600",
    info: "bg-cyan-500 text-white hover:bg-cyan-600",
    warning: "bg-orange-500 text-white hover:bg-orange-600",
  };
  return variants[props.variant] || variants.primary;
});

// サイズのクラス
const sizeClasses = computed(() => {
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  return sizes[props.size] || sizes.md;
});
</script>
