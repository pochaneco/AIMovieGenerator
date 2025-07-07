<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-4">
      <label class="block mb-1 font-medium">{{ $t("projectName") }}</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full border rounded px-3 py-2"
        :placeholder="$t('projectNameExample')"
      />
    </div>
    <div class="mb-4">
      <label class="block mb-1 font-medium">{{ $t("description") }}</label>
      <textarea
        v-model="form.description"
        class="w-full border rounded px-3 py-2"
        rows="25"
        :placeholder="$t('projectDescription')"
      ></textarea>
    </div>
    <CoolButton type="submit" color="primary" class="mr-2">{{
      editIndex === null ? $t("add") : $t("save")
    }}</CoolButton>
    <CoolButton
      v-if="editIndex !== null"
      type="button"
      color="secondary"
      @click="$emit('cancel')"
      >{{ $t("cancel") }}</CoolButton
    >
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
