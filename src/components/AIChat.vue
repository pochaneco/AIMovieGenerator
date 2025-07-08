<template>
  <!-- AIチャットコンテナ -->
  <div class="relative flex">
    <!-- サイドバー開閉ボタン -->
    <div
      @click="toggleChat"
      class="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-full w-8 h-16 bg-sky-500 hover:bg-sky-600 text-white cursor-pointer flex items-center justify-center transition-all z-[9999] rounded-l-lg shadow-lg"
      :title="isOpen ? $t('close') : $t('openAIChat')"
    >
      <Icon :name="isOpen ? 'chevron-right' : 'chat'" size="sm" />
    </div>

    <!-- サイドバーチャット -->
    <div
      ref="chatWindow"
      class="h-full bg-white border-l border-gray-100 shadow-xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out relative"
      :style="{
        width: (isOpen ? chatWidth : 0) + 'px',
        minWidth: isOpen ? '300px' : '0px',
        maxWidth: isOpen ? '600px' : '0px',
      }"
    >
      <!-- カスタムリサイズハンドル -->
      <ResizeHandle v-show="isOpen" @start-resize="startResize" />

      <!-- ヘッダー -->
      <ChatHeader
        v-show="isOpen"
        :selected-config-and-model="selectedConfigAndModel"
        :available-configs="availableConfigs"
        @model-change="onModelChange"
        @download-chat="downloadChat"
        @clear-chat="clearChat"
      />

      <!-- チャットメッセージエリア -->
      <ChatMessageList
        v-show="isOpen"
        ref="messageListRef"
        :messages="messages"
        :is-typing="isTyping"
      />

      <!-- 入力エリア -->
      <ChatInputArea
        v-show="isOpen"
        v-model:message="newMessage"
        :is-typing="isTyping"
        :available-configs="availableConfigs"
        @send-message="sendMessage"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import { useI18n } from "vue-i18n";
import Icon from "./Icon.vue";
import ChatHeader from "./ChatHeader.vue";
import ChatMessageList from "./ChatMessageList.vue";
import ChatInputArea from "./ChatInputArea.vue";
import ResizeHandle from "./ResizeHandle.vue";
import {
  getActiveLLMConfig,
  getLLMConfigs,
  getSetting,
  saveSetting,
} from "@/services/dataService.js";
import { getChatResponse, getAvailableModels } from "@/utils/llmService.js";
import { executeCommand, isCommand } from "@/services/commandService.js";

const { t } = useI18n();

// システムプロンプトの定数定義
const SYSTEM_PROMPT = `あなたは親切で知識豊富なAIアシスタントです。以下の特徴を持って会話してください：

1. **正確性**: 事実に基づいた正確な情報を提供する
2. **分かりやすさ**: 複雑な内容も理解しやすく説明する
3. **親切さ**: ユーザーの立場に立って丁寧に対応する
4. **具体性**: 必要に応じて具体例やステップバイステップの説明を提供する
5. **簡潔性**: 冗長にならず、要点を明確に伝える

このWebサービスはユーザーがAIを利用して動画の台本を作成することができます。

台本の作成にはプロジェクトが先に存在する必要があります。
コマンドを利用してユーザーの制作をサポートします。

ユーザーが動画制作、台本作成に関する質問をした場合は、特に詳しく実用的なアドバイスを提供してください。`;

const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref("");
const isTyping = ref(false);
const messageListRef = ref(null);
const selectedConfigAndModel = ref("");
const availableConfigs = ref([]);
const chatWidth = ref(384); // デフォルトの幅（w-96に相当）
const chatWindow = ref(null);
const isResizing = ref(false);

// 現在選択されている設定とモデルを計算
const selectedConfig = computed(() => {
  if (!selectedConfigAndModel.value) return null;
  const [configId] = selectedConfigAndModel.value.split("|");
  return availableConfigs.value.find((config) => config.id === configId);
});

const selectedModel = computed(() => {
  if (!selectedConfigAndModel.value) return "";
  const [, model] = selectedConfigAndModel.value.split("|");
  return model;
});

const STORAGE_KEY = "ai_chat_messages";
const WIDTH_STORAGE_KEY = "ai_chat_width";
const SELECTED_MODEL_STORAGE_KEY = "ai_chat_selected_model";

// リサイズイベントリスナーを格納する変数
let cleanupResizeListeners = null;

onMounted(async () => {
  await loadMessages();
  await loadChatWidth();
  await loadConfigs();
  await checkLLMConfig();
  await loadSelectedModel();
  setupResizeObserver();
});

// ライフサイクルフックを最初に登録
onUnmounted(() => {
  if (cleanupResizeListeners) {
    cleanupResizeListeners();
  }
});

async function loadConfigs() {
  try {
    availableConfigs.value = await getLLMConfigs();
  } catch (error) {
    console.error("LLM設定の読み込みに失敗しました:", error);
    availableConfigs.value = [];
  }
}

async function checkLLMConfig() {
  try {
    const activeConfig = await getActiveLLMConfig();

    if (availableConfigs.value.length > 0 && !selectedConfigAndModel.value) {
      if (activeConfig) {
        selectedConfigAndModel.value = `${activeConfig.id}|${activeConfig.defaultModel}`;
      } else {
        const firstConfig = availableConfigs.value[0];
        const firstModel = getAvailableModels(firstConfig.provider)[0];
        selectedConfigAndModel.value = `${firstConfig.id}|${firstModel}`;
      }
    }
  } catch (error) {
    console.error("LLM設定の確認に失敗しました:", error);
  }
}

async function loadMessages() {
  try {
    const stored = await getSetting(STORAGE_KEY, []);
    messages.value = Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("チャット履歴の読み込みに失敗しました:", error);
    messages.value = [];
  }
}

async function saveMessages() {
  try {
    // オブジェクトをプレーンなJSONに変換してからIndexedDBに保存
    const messagesPlain = JSON.parse(JSON.stringify(messages.value));
    await saveSetting(STORAGE_KEY, messagesPlain);
  } catch (error) {
    console.error("チャット履歴の保存に失敗しました:", error);
  }
}

async function loadChatWidth() {
  try {
    const stored = await getSetting(WIDTH_STORAGE_KEY, 384);
    chatWidth.value = typeof stored === "number" ? stored : 384;
  } catch (error) {
    console.error("チャット幅の読み込みに失敗しました:", error);
    chatWidth.value = 384;
  }
}

async function saveChatWidth() {
  try {
    await saveSetting(WIDTH_STORAGE_KEY, chatWidth.value);
  } catch (error) {
    console.error("チャット幅の保存に失敗しました:", error);
  }
}

async function loadSelectedModel() {
  try {
    const stored = await getSetting(SELECTED_MODEL_STORAGE_KEY, "");
    if (stored && availableConfigs.value.length > 0) {
      // 保存されたモデルが利用可能な設定に存在するか確認
      const [configId, model] = stored.split("|");
      const config = availableConfigs.value.find((c) => c.id === configId);
      if (config && getAvailableModels(config.provider).includes(model)) {
        selectedConfigAndModel.value = stored;
        return;
      }
    }
  } catch (error) {
    console.error("選択モデルの読み込みに失敗しました:", error);
  }
}

async function saveSelectedModel() {
  try {
    if (selectedConfigAndModel.value) {
      await saveSetting(
        SELECTED_MODEL_STORAGE_KEY,
        selectedConfigAndModel.value
      );
    }
  } catch (error) {
    console.error("選択モデルの保存に失敗しました:", error);
  }
}

function setupResizeObserver() {
  // カスタムリサイズ機能のイベントリスナーを設定
  const { handleMouseMove, handleMouseUp } = setupCustomResize();

  // クリーンアップ関数を設定
  cleanupResizeListeners = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}

function setupCustomResize() {
  // マウス移動とマウスアップのイベントリスナーを設定
  const handleMouseMove = (e) => {
    if (!isResizing.value || !chatWindow.value) return;

    e.preventDefault();

    // マウスの位置からサイドバーの幅を計算
    const rect = chatWindow.value.getBoundingClientRect();
    const newWidth = rect.right - e.clientX;

    // 最小幅と最大幅の制限
    const minWidth = 300;
    const maxWidth = 600;
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

    chatWidth.value = clampedWidth;
  };

  const handleMouseUp = () => {
    if (isResizing.value) {
      isResizing.value = false;
      saveChatWidth(); // async関数だが、awaitしない（UI応答性のため）
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
  };

  // グローバルイベントリスナーを追加
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  // 関数を返す
  return { handleMouseMove, handleMouseUp };
}

function startResize(e) {
  if (!isOpen.value) return;

  e.preventDefault();
  isResizing.value = true;

  // リサイズ中のカーソルスタイルを設定
  document.body.style.cursor = "ew-resize";
  document.body.style.userSelect = "none";
}

function toggleChat() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}

function scrollToBottom() {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom();
  }
}

function onModelChange(newValue) {
  selectedConfigAndModel.value = newValue;

  // モデル変更をユーザーに通知
  if (selectedConfigAndModel.value) {
    const config = selectedConfig.value;
    const model = selectedModel.value;

    if (config && model) {
      // 選択されたモデルを保存
      saveSelectedModel(); // async関数だが、awaitしない（UI応答性のため）

      const systemMessage = {
        id: Date.now(),
        role: "system",
        content: `${t("modelChanged")}: ${config.name} - ${model}`,
        timestamp: new Date().toISOString(),
      };
      // プレーンオブジェクトとして追加
      messages.value.push(JSON.parse(JSON.stringify(systemMessage)));
      saveMessages(); // async関数だが、awaitしない（UI応答性のため）

      nextTick(() => {
        scrollToBottom();
      });
    }
  }
}

async function sendMessage() {
  if (
    !newMessage.value.trim() ||
    isTyping.value ||
    availableConfigs.value.length === 0
  )
    return;

  // 現在選択されているモデルを保存
  saveSelectedModel(); // async関数だが、awaitしない（UI応答性のため）

  const userMessage = {
    id: Date.now(),
    role: "user",
    content: newMessage.value.trim(),
    timestamp: new Date().toISOString(),
  };

  // プレーンオブジェクトとして追加
  messages.value.push(JSON.parse(JSON.stringify(userMessage)));
  const messageToSend = newMessage.value.trim();
  // 送信成功時まで入力をクリアしない
  isTyping.value = true;

  nextTick(() => {
    scrollToBottom();
  });

  try {
    let aiResponse;

    // コマンドかどうかをチェック
    if (isCommand(messageToSend)) {
      // コマンドを実行
      aiResponse = await executeCommand(messageToSend);
    } else {
      // 通常のAI応答を取得
      aiResponse = await getAIResponse(messageToSend);
    }

    const aiMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    };

    // プレーンオブジェクトとして追加
    messages.value.push(JSON.parse(JSON.stringify(aiMessage)));
    saveMessages(); // async関数だが、awaitしない（UI応答性のため）

    // 送信が成功した場合のみ入力欄をクリア
    newMessage.value = "";
  } catch (error) {
    console.error("AI応答の取得に失敗しました:", error);

    const errorMessage = {
      id: Date.now() + 1,
      role: "assistant",
      content: t("aiResponseError") + ": " + error.message,
      timestamp: new Date().toISOString(),
    };

    // プレーンオブジェクトとして追加
    messages.value.push(JSON.parse(JSON.stringify(errorMessage)));
    saveMessages(); // async関数だが、awaitしない（UI応答性のため）

    // エラーが発生した場合は入力欄をクリアしない（ユーザーが再送信できるように）
  } finally {
    isTyping.value = false;
    nextTick(() => {
      scrollToBottom();
    });
  }
}

async function getAIResponse(message) {
  try {
    // 選択された設定とモデルを使用
    const config = selectedConfig.value;
    const model = selectedModel.value;

    if (!config || !model) {
      throw new Error(t("noConfigSelected"));
    }

    // カスタムモデル設定を作成
    const customConfig = {
      ...config,
      defaultModel: model,
    };

    // システムプロンプトを作成
    const systemPrompt = {
      role: "system",
      content: SYSTEM_PROMPT,
    };

    // 既存のメッセージ履歴を取得（systemメッセージは除外）
    const userMessages = messages.value.filter((msg) => msg.role !== "system");

    // システムプロンプトを先頭に追加して会話履歴を構築
    const conversationHistory = [systemPrompt, ...userMessages];

    // デバッグ用ログ
    console.log(
      "AIChat: 送信される会話履歴",
      conversationHistory.map((msg) => ({
        role: msg.role,
        content:
          msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
      }))
    );

    const response = await getChatResponse(conversationHistory, customConfig);
    return response || t("aiDefaultResponse");
  } catch (error) {
    throw new Error(error.message || t("aiResponseFailed"));
  }
}

function clearChat() {
  const confirmed = confirm(t("confirmClearChat"));
  if (confirmed) {
    messages.value = [];
    saveMessages(); // async関数だが、awaitしない（UI応答性のため）
  }
}

function downloadChat() {
  if (messages.value.length === 0) {
    alert(t("noChatToDownload"));
    return;
  }

  const chatText = messages.value
    .map((message) => {
      const time = new Date(message.timestamp).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
      });
      let role;

      switch (message.role) {
        case "user":
          role = t("you");
          break;
        case "assistant":
          role = "AI";
          break;
        case "system":
          role = "System";
          break;
        default:
          role = message.role;
      }

      return `[${time}] ${role}: ${message.content}`;
    })
    .join("\n\n");

  const blob = new Blob([chatText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ai-chat-${new Date().toISOString().split("T")[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
</script>

<style scoped>
/* カスタムリサイズハンドルのスタイリング */
.cursor-ew-resize {
  cursor: ew-resize;
}

/* リサイズ中の全体的なスタイル調整 */
body.resizing {
  cursor: ew-resize !important;
  user-select: none !important;
}
</style>
