<template>
  <Modal :show="show" :title="modalTitle" size="xl" @close="onClose">
    <CharacterForm
      :form="form"
      :editIndex="editIndex"
      @submit="onSubmit"
      @cancel="onClose"
    />
  </Modal>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import Modal from "../../../components/Modal.vue";
import CharacterForm from "./CharacterForm.vue";

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  form: Object,
  editIndex: Number,
});

const emit = defineEmits(["close", "submit"]);

const modalTitle = computed(() => {
  return `${props.editIndex === null ? t("add") : t("edit")} ${t(
    "characterName"
  )}`;
});

function onClose() {
  emit("close");
}

function onSubmit() {
  emit("submit");
}
</script>
