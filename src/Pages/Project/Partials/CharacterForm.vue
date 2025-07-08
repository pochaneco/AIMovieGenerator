<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-4">
      <label class="block mb-1 font-medium">{{ $t("characterName") }}</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full border rounded px-3 py-2 mb-3"
        :placeholder="$t('characterName')"
      />
      <label class="block mb-1 font-medium">{{ $t("role") }}</label>
      <textarea
        v-model="form.role"
        class="w-full border rounded px-3 py-2 mb-3"
        rows="3"
        :placeholder="$t('role')"
      ></textarea>
      <CoolButton type="submit" variant="primary" class="mr-2">{{
        editIndex === null ? $t("add") : $t("save")
      }}</CoolButton>
      <CoolButton
        v-if="editIndex !== null"
        type="button"
        color="secondary"
        @click="$emit('cancel')"
        >{{ $t("cancel") }}</CoolButton
      >
    </div>
  </form>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
const props = defineProps({
  form: Object,
  editIndex: Number,
});
const emit = defineEmits(["submit", "cancel"]);
function onSubmit() {
  emit("submit");
}
</script>
