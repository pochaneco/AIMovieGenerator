<template>
  <div class="mb-4">
    <label v-if="label" class="block mb-1 font-medium">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- テキスト入力 -->
    <input
      v-if="type === 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :class="inputClasses"
      :placeholder="placeholder"
      :required="required"
    />

    <!-- パスワード入力 -->
    <input
      v-else-if="type === 'password'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="password"
      :class="inputClasses"
      :placeholder="placeholder"
      :required="required"
    />

    <!-- テキストエリア -->
    <textarea
      v-else-if="type === 'textarea'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :class="inputClasses"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
    ></textarea>

    <!-- セレクトボックス -->
    <select
      v-else-if="type === 'select'"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="inputClasses"
      :required="required"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- エラーメッセージ -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <!-- ヘルプテキスト -->
    <p v-if="help" class="mt-1 text-sm text-gray-500">{{ help }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  type: {
    type: String,
    default: "text",
    validator: (value) =>
      ["text", "password", "textarea", "select"].includes(value),
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  help: {
    type: String,
    default: "",
  },
  rows: {
    type: Number,
    default: 3,
  },
  options: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["update:modelValue"]);

const inputClasses = computed(() => {
  const baseClasses =
    "w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-colors";
  const errorClasses = props.error ? "border-red-500" : "border-gray-300";
  const selectClasses = props.type === "select" ? "bg-white" : "";

  return `${baseClasses} ${errorClasses} ${selectClasses}`;
});
</script>
