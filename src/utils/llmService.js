/**
 * LLMサービス - 各社のLLM APIを統一的に使用するためのサービス
 * LangChainを使用して複数のプロバイダーに対応
 * 複数設定の保存・管理機能付き
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  getLLMConfigs,
  getActiveLLMConfig,
  getSetting,
  saveSetting,
} from "../services/dataService.js";

// 対応プロバイダーの定義
export const LLM_PROVIDERS = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
};

// プロバイダー情報
export const PROVIDER_INFO = {
  [LLM_PROVIDERS.OPENAI]: {
    name: "OpenAI",
    models: [
      "gpt-4.1",
      "o4-mini",
      "o3",
      "o3-pro (very expensive)",
      "o3-mini",
      "o1 (expensive)",
      "o1-mini",
      "o1-pro (most expensive)",
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-4o",
      "gpt-4o-nano",
    ],
    defaultModel: "gpt-4",
    apiKeyRequired: true,
    icon: "🤖",
  },
  [LLM_PROVIDERS.ANTHROPIC]: {
    name: "Anthropic",
    models: [
      "claude-opus-4-20250514",
      "claude-sonnet-4-20250514",
      "claude-3-7-sonnet-20250219",
      "claude-3-5-haiku-20241022",
    ],
    defaultModel: "claude-3-sonnet-20240229",
    apiKeyRequired: true,
    icon: "🎭",
  },
  [LLM_PROVIDERS.GOOGLE]: {
    name: "Google Gemini",
    models: [
      "gemini-2.5-pro",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ],
    defaultModel: "gemini-pro",
    apiKeyRequired: true,
    icon: "🔍",
  },
};

/**
 * 設定されたプロバイダーとモデルを取得（後方互換性のため残す）
 */
export async function getLLMSettings() {
  try {
    const activeConfig = await getActiveLLMConfig();
    if (activeConfig) {
      return {
        provider: activeConfig.provider,
        model: activeConfig.defaultModel,
        config: activeConfig,
      };
    }

    // フォールバック: 古い設定形式をチェック
    const provider = await getSetting("llm_provider", LLM_PROVIDERS.OPENAI);
    const model = await getSetting(
      "llm_model",
      PROVIDER_INFO[provider]?.defaultModel || "gpt-4"
    );
    return { provider, model, config: null };
  } catch (error) {
    console.error("LLM設定の取得に失敗:", error);
    return {
      provider: LLM_PROVIDERS.OPENAI,
      model: PROVIDER_INFO[LLM_PROVIDERS.OPENAI].defaultModel,
      config: null,
    };
  }
}

/**
 * LLMインスタンスを作成（特定の設定とモデルを指定）
 */
export async function createLLMInstance(configId = null, modelName = null) {
  let config, apiKey, model;

  if (configId) {
    // 指定された設定を使用
    const configs = await getLLMConfigs();
    config = configs.find((c) => c.id === configId);
    if (!config) {
      throw new Error("指定されたLLM設定が見つかりません");
    }
    apiKey = config.apiKey;
    model = modelName || config.defaultModel;
  } else {
    // アクティブな設定を使用
    const settings = await getLLMSettings();
    config = settings.config;
    if (!config) {
      throw new Error(
        "LLM設定が見つかりません。設定画面でLLMを設定してください。"
      );
    }
    apiKey = config.apiKey;
    model = modelName || settings.model;
  }

  if (!apiKey) {
    throw new Error("APIキーが設定されていません。");
  }

  try {
    switch (config.provider) {
      case LLM_PROVIDERS.OPENAI:
        return new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: model,
          temperature: 0.7,
        });

      case LLM_PROVIDERS.ANTHROPIC:
        return new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: model,
          temperature: 0.7,
        });

      case LLM_PROVIDERS.GOOGLE:
        return new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          model: model, // modelNameではなくmodel
          temperature: 0.7,
        });

      default:
        throw new Error(`サポートされていないプロバイダー: ${config.provider}`);
    }
  } catch (error) {
    console.error("LLMインスタンスの作成に失敗:", error);
    throw new Error(`LLMの初期化に失敗しました: ${error.message}`);
  }
}

/**
 * テキスト生成（設定IDとモデルを指定可能）
 */
export async function generateText(prompt, options = {}) {
  try {
    const { configId = null, modelName = null } = options;
    const llm = await createLLMInstance(configId, modelName);
    const response = await llm.invoke(prompt);
    return response.content;
  } catch (error) {
    console.error("テキスト生成エラー:", error);
    throw error;
  }
}

/**
 * シーン作成関数 - LLMツールとして使用
 */
function createScene(title, description, duration = "2分") {
  return {
    id: Date.now() + Math.random(),
    type: "scene",
    title,
    content: description,
    duration,
    lines: [],
  };
}

/**
 * シーンにライン追加関数 - LLMツールとして使用
 */
function addLineToScene(
  scene,
  character,
  content,
  emotion = "普通",
  type = "line"
) {
  const line = {
    id: Date.now() + Math.random(),
    type,
    character,
    content,
    emotion,
  };

  if (!scene.lines) {
    scene.lines = [];
  }
  scene.lines.push(line);
  return line;
}

/**
 * 台本生成用の専用関数（設定IDとモデルを指定可能）
 */
export async function generateScript(projectData, scriptData, options = {}) {
  const { configId = null, modelName = null, scriptSettings = {} } = options;

  // 台本設定のデフォルト値
  const settings = {
    totalDuration: scriptSettings.totalDuration || "10分",
    sceneCount: scriptSettings.sceneCount || 3,
    averageSceneDuration: scriptSettings.averageSceneDuration || "3分",
    ...scriptSettings,
  };

  const characters = projectData?.characters || [];
  const charactersInfo =
    characters.length > 0
      ? `登場キャラクター: ${characters
          .map((c) => `${c.name}(${c.role || c.description || ""})`)
          .join(", ")}`
      : "";

  // 構造化された出力プロンプト
  const prompt = `
以下の情報をもとに、映画の台本を作成してください：

プロジェクト名: ${projectData?.name || "未設定"}
プロジェクト説明: ${projectData?.description || ""}
台本タイトル: ${scriptData?.title || "未設定"}
台本説明: ${scriptData?.description || ""}
${charactersInfo}

台本設定:
- 全体の長さ: ${settings.totalDuration}
- シーン数: ${settings.sceneCount}個
- 1シーンあたりの平均時間: ${settings.averageSceneDuration}

以下のマークダウン形式で台本を出力してください：

## シーン1: [シーンタイトル] ([時間])
*[シーンの説明・状況設定]

キャラクター名: セリフ内容 [感情]
キャラクター名: セリフ内容 [感情]
【ナレーション: ナレーション内容】

## シーン2: [シーンタイトル] ([時間])
*[シーンの説明・状況設定]

...

要求:
1. 各シーンには明確なタイトルと時間を設定
2. シーンの説明は「*」で始める
3. セリフは「キャラクター名: 内容 [感情]」の形式
4. ナレーションは「【ナレーション: 内容】」の形式
5. キャラクターの個性を活かした自然な対話
6. ストーリーの起承転結を意識した構成
7. 各シーンの時間配分は設定に従う

台本を作成してください。
`;

  try {
    console.log("台本生成プロンプト送信:", {
      projectName: projectData?.name,
      scriptTitle: scriptData?.title,
      settings,
    });

    const llm = await createLLMInstance(configId, modelName);
    const response = await llm.invoke(prompt);

    console.log("台本生成完了");
    return response.content;
  } catch (error) {
    console.error("台本生成エラー:", error);
    throw new Error(`台本生成に失敗しました: ${error.message}`);
  }
}

/**
 * APIキーのテスト（新しい設定形式対応）
 */
export async function testApiKey(provider, apiKey, model) {
  try {
    // 入力パラメータの検証
    if (!provider || !apiKey || !model) {
      throw new Error(
        `必要なパラメータが不足しています: provider=${provider}, apiKey=${
          apiKey ? "****" : "なし"
        }, model=${model}`
      );
    }

    console.log(`APIキーテスト開始: ${provider} / ${model}`);

    let llm;

    switch (provider) {
      case LLM_PROVIDERS.OPENAI:
        llm = new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: model,
          temperature: 0.1,
        });
        break;

      case LLM_PROVIDERS.ANTHROPIC:
        llm = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: model,
          temperature: 0.1,
        });
        break;

      case LLM_PROVIDERS.GOOGLE:
        console.log("Google Gemini設定:", {
          apiKey: apiKey ? "****" : "なし",
          model,
        });
        llm = new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          model: model, // modelNameではなくmodel
          temperature: 0.1,
        });
        break;

      default:
        throw new Error(`サポートされていないプロバイダー: ${provider}`);
    }

    // テスト用の簡単なプロンプト
    const response = await llm.invoke(
      "Hello, please respond with 'API test successful'"
    );

    // responseの構造をログに出力してデバッグ
    console.log("LLM Response for", provider, ":", response);

    // responseがundefinedまたはnullの場合の処理
    if (!response) {
      throw new Error("LLMからの応答が空です");
    }

    // responseの内容を取得（プロバイダーによって構造が異なる可能性）
    let content = response.content || response.text || response;

    // contentが文字列でない場合の処理
    if (typeof content !== "string") {
      content = String(content);
    }

    return { success: true, response: content };
  } catch (error) {
    console.error("APIキーテストエラー:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 設定をテスト（LLM設定オブジェクトを使用）
 */
export async function testLLMConfig(config) {
  return await testApiKey(config.provider, config.apiKey, config.defaultModel);
}

/**
 * 利用可能なプロバイダー一覧を取得
 */
export function getAvailableProviders() {
  return Object.values(LLM_PROVIDERS).map((provider) => ({
    id: provider,
    ...PROVIDER_INFO[provider],
  }));
}

/**
 * 特定プロバイダーの利用可能モデル一覧を取得
 */
export function getAvailableModels(provider) {
  return PROVIDER_INFO[provider]?.models || [];
}

/**
 * 設定の名前を生成（重複チェック付き）
 */
export async function generateConfigName(provider) {
  const configs = await getLLMConfigs();
  const providerName = PROVIDER_INFO[provider]?.name || provider;
  const existing = configs.filter((c) => c.name.startsWith(providerName));

  if (existing.length === 0) {
    return providerName;
  }

  return `${providerName} (${existing.length + 1})`;
}

/**
 * チャット用のAI応答を取得
 * @param {string|Array} messages - 単一メッセージまたはメッセージ履歴の配列
 * @param {Object} config - LLM設定
 */
export async function getChatResponse(messages, config = null) {
  try {
    // configが指定されていない場合はアクティブ設定を使用
    const llmConfig = config || (await getActiveLLMConfig());

    if (!llmConfig) {
      throw new Error("アクティブなLLM設定がありません");
    }

    let llm;
    const { provider, apiKey, defaultModel } = llmConfig;

    switch (provider) {
      case LLM_PROVIDERS.OPENAI:
        llm = new ChatOpenAI({
          openAIApiKey: apiKey,
          modelName: defaultModel,
          temperature: 0.7,
        });
        break;

      case LLM_PROVIDERS.ANTHROPIC:
        llm = new ChatAnthropic({
          anthropicApiKey: apiKey,
          modelName: defaultModel,
          temperature: 0.7,
        });
        break;

      case LLM_PROVIDERS.GOOGLE:
        llm = new ChatGoogleGenerativeAI({
          apiKey: apiKey,
          model: defaultModel,
          temperature: 0.7,
        });
        break;

      default:
        throw new Error(`サポートされていないプロバイダー: ${provider}`);
    }

    // メッセージを適切な形式に変換
    let input;
    if (typeof messages === "string") {
      // 単一メッセージの場合
      input = [new HumanMessage(messages)];
    } else if (Array.isArray(messages)) {
      // メッセージ履歴の場合、LangChainのメッセージオブジェクトに変換
      input = messages
        .filter((msg) => msg.role !== "system") // システムメッセージは除外
        .map((msg) => {
          if (msg.role === "user") {
            return new HumanMessage(msg.content);
          } else if (msg.role === "assistant") {
            return new AIMessage(msg.content);
          }
          return new HumanMessage(msg.content); // デフォルトはHumanMessage
        });

      // デバッグ用ログ
      console.log(
        "送信される会話履歴:",
        input.map((msg) => ({
          type: msg.constructor.name,
          content: msg.content,
        }))
      );
    } else {
      input = [new HumanMessage(String(messages))];
    }

    // AI応答を取得
    const response = await llm.invoke(input);

    // responseの内容を取得（プロバイダーによって構造が異なる可能性）
    let content = response.content || response.text || response;

    // contentが文字列でない場合の処理
    if (typeof content !== "string") {
      content = String(content);
    }

    return content;
  } catch (error) {
    console.error("チャット応答エラー:", error);
    throw new Error(error.message || "AI応答の取得に失敗しました");
  }
}
