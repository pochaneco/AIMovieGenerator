/**
 * 台本生成ユーティリティ
 */

import { getApiKey } from "./apiKeyManager.js";

// 将来のAI生成機能で使用予定
// const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * サンプル台本を生成
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @returns {string} 生成された台本内容
 */
export function generateSampleScript(script, project) {
  const projectName = project?.name || "未設定";
  const characters = project?.characters || [];

  let sampleScript = `# ${script.title}\n\n`;
  sampleScript += `## プロジェクト: ${projectName}\n\n`;

  if (characters.length > 0) {
    sampleScript += `## 登場キャラクター\n`;
    characters.forEach((char) => {
      sampleScript += `- ${char.name}: ${char.description}\n`;
    });
    sampleScript += "\n";
  }

  sampleScript += `## シナリオ\n\n`;
  sampleScript += `${script.description}\n\n`;
  sampleScript += `## シーン1\n\n`;

  if (characters.length >= 2) {
    sampleScript += `${characters[0].name}: こんにちは、${characters[1].name}さん。\n\n`;
    sampleScript += `${characters[1].name}: はい、こんにちは。今日はいい天気ですね。\n\n`;
    sampleScript += `${characters[0].name}: そうですね。お散歩日和です。\n\n`;
  } else {
    sampleScript += `ナレーター: 物語が始まります。\n\n`;
    sampleScript += `主人公: これは新しい冒険の始まりだ。\n\n`;
  }

  sampleScript += `## シーン2\n\n`;
  sampleScript += `（場面転換）\n\n`;
  sampleScript += `ナレーター: そして物語は続いていく...\n\n`;
  sampleScript += `## 終わり\n`;

  return sampleScript;
}

/**
 * 台本を構造化された配列形式で生成
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @returns {Array} 構造化された台本内容配列
 */
export function generateStructuredScript(script, project) {
  const projectName = project?.name || "未設定";
  const characters = project?.characters || [];

  const scriptContent = [];

  // ヘッダー情報
  scriptContent.push({
    id: Date.now() + 1,
    type: "header",
    title: script.title,
    project: projectName,
    description: script.description,
  });

  // キャラクター紹介
  if (characters.length > 0) {
    scriptContent.push({
      id: Date.now() + 2,
      type: "characters",
      title: "登場キャラクター",
      characters: characters.map((char) => ({
        name: char.name,
        description: char.description,
      })),
    });
  }

  // シーン1: オープニング
  scriptContent.push({
    id: Date.now() + 3,
    type: "scene",
    title: "シーン1: オープニング",
    content: "物語の始まりです。主人公が登場します。",
    duration: "3分",
  });

  if (characters.length >= 2) {
    scriptContent.push({
      id: Date.now() + 4,
      type: "dialogue",
      character: characters[0].name,
      content: `こんにちは、${characters[1].name}さん。`,
      emotion: "親しみやすい",
    });

    scriptContent.push({
      id: Date.now() + 5,
      type: "dialogue",
      character: characters[1].name,
      content: "はい、こんにちは。今日はいい天気ですね。",
      emotion: "穏やか",
    });

    scriptContent.push({
      id: Date.now() + 6,
      type: "dialogue",
      character: characters[0].name,
      content: "そうですね。お散歩日和です。",
      emotion: "同意",
    });
  } else {
    scriptContent.push({
      id: Date.now() + 4,
      type: "narration",
      content: "物語が始まります。",
    });

    scriptContent.push({
      id: Date.now() + 5,
      type: "dialogue",
      character: "主人公",
      content: "これは新しい冒険の始まりだ。",
      emotion: "決意",
    });
  }

  // シーン2
  scriptContent.push({
    id: Date.now() + 7,
    type: "scene",
    title: "シーン2: 展開",
    content: "場面転換。新たな展開が始まります。",
    duration: "2分",
  });

  scriptContent.push({
    id: Date.now() + 8,
    type: "action",
    content: "（場面転換）",
  });

  scriptContent.push({
    id: Date.now() + 9,
    type: "narration",
    content: "そして物語は続いていく...",
  });

  // エンディング
  scriptContent.push({
    id: Date.now() + 10,
    type: "scene",
    title: "エンディング",
    content: "物語の終わりです。",
    duration: "1分",
  });

  return scriptContent;
}

/**
 * AI台本生成（モック関数）
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @param {Function} onProgress - 進捗コールバック
 * @returns {Promise<Object>} 生成結果
 */
export async function generateAIScript(script, project, onProgress = null) {
  // モック実装：実際のAI生成APIを呼び出す場合はここを置き換える
  const steps = [
    "プロジェクト分析中...",
    "キャラクター設定を確認中...",
    "シナリオ構造を作成中...",
    "台本を生成中...",
    "最終調整中...",
  ];

  for (let i = 0; i < steps.length; i++) {
    if (onProgress) {
      onProgress({
        step: i + 1,
        total: steps.length,
        message: steps[i],
        progress: ((i + 1) / steps.length) * 100,
      });
    }

    // 各ステップで1秒待機
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // 台本生成結果
  return {
    success: true,
    content: generateSampleScript(script, project),
    structuredContent: generateStructuredScript(script, project),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * 台本生成エラーハンドリング
 * @param {Error} error - エラーオブジェクト
 * @returns {Object} エラー情報
 */
export function handleGenerationError(error) {
  console.error("台本生成エラー:", error);

  return {
    success: false,
    error: error.message || "台本生成中にエラーが発生しました",
    timestamp: new Date().toISOString(),
  };
}
