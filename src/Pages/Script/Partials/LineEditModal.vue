<template>
  <Modal :show="show" title="セリフ編集" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <!-- キャラクター選択 -->
        <FormField label="キャラクター" required>
          <select
            v-model="form.character"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">キャラクターを選択</option>
            <option
              v-for="character in availableCharacters"
              :key="character.name"
              :value="character.name"
            >
              {{ character.name }}
            </option>
          </select>
        </FormField>

        <!-- セリフ内容 -->
        <FormField label="セリフ内容" required>
          <textarea
            v-model="form.content"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="セリフを入力してください"
          ></textarea>
        </FormField>

        <!-- 感情表現 -->
        <FormField label="感情表現">
          <input
            v-model="form.emotion"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 喜び、悲しみ、怒り"
          />
        </FormField>
      </div>

      <!-- ボタン -->
      <div class="flex gap-4 justify-end mt-6">
        <CoolButton type="button" @click="$emit('close')" variant="secondary">
          {{ $t("cancel") }}
        </CoolButton>
        <CoolButton
          type="submit"
          variant="primary"
          :disabled="!form.character || !form.content"
        >
          {{ $t("save") }}
        </CoolButton>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Modal from "@/components/Modal.vue";
import FormField from "@/components/FormField.vue";
import CoolButton from "@/components/CoolButton.vue";

const { t } = useI18n();

const props = defineProps({
  show: Boolean,
  line: Object,
  availableCharacters: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  character: "",
  content: "",
  emotion: "普通",
});

// propsが変更されたらフォームを更新
watch(
  () => props.line,
  (newLine) => {
    if (newLine) {
      form.value = {
        character: newLine.character || "",
        content: newLine.content || "",
        emotion: newLine.emotion || "普通",
      };
    } else {
      form.value = {
        character: "",
        content: "",
        emotion: "普通",
      };
    }
  },
  { immediate: true }
);

function handleSubmit() {
  if (!form.value.character || !form.value.content) return;

  emit("save", { ...form.value });
}
</script>
