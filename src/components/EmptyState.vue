<template>
  <div class="text-center py-12 text-gray-500">
    <Icon :name="icon" :size="iconSize" class="mx-auto text-gray-400 mb-4" />
    <h3 v-if="title" class="text-lg font-medium mb-2">{{ title }}</h3>
    <p class="mb-4">{{ message }}</p>
    <CoolButton
      v-if="buttonText"
      @click="$emit('action')"
      variant="primary"
      class="mt-4"
    >
      {{ buttonText }}
    </CoolButton>
  </div>
</template>

<script setup>
import Icon from "@/components/Icon.vue";
import CoolButton from "@/components/CoolButton.vue";

defineProps({
  icon: {
    type: String,
    default: "inbox",
  },
  iconSize: {
    type: String,
    default: "2xl",
  },
  title: {
    type: String,
    default: null,
  },
  message: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: null,
  },
});

defineEmits(["action"]);
</script>
