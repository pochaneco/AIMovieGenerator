<template>
  <Modal :show="show" :title="modalTitle" size="xl" @close="onClose">
    <ProjectForm
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
import ProjectForm from "./ProjectForm.vue";

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  form: Object,
  editIndex: Number,
});

const emit = defineEmits(["close", "submit"]);

const modalTitle = computed(() => {
  return `${props.editIndex === null ? t("add") : t("edit")} ${t(
    "projectSettings"
  )}`;
});

function onClose() {
  emit("close");
}

function onSubmit() {
  emit("submit");
}
</script>
