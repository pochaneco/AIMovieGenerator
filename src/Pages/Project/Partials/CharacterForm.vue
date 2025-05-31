<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-2">
      <input
        v-model="form.name"
        type="text"
        class="border rounded px-2 py-1 mr-2"
        :placeholder="$t('characterName')"
      />
      <input
        v-model="form.role"
        type="text"
        class="border rounded px-2 py-1 mr-2"
        :placeholder="$t('role')"
      />
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
