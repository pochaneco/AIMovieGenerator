/**
 * 台本生成ユーティリティ
 */

import { generateScript } from "./llmService.js";

/**
 * 台本を構造化された配列形式で生成（LLM使用）
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @param {Object} options - 生成オプション（configId, modelName, scriptSettings）
 * @returns {Promise<Array>} 構造化された台本内容配列
 */
export async function generateStructuredScript(script, project, options = {}) {
  try {
    // AI台本生成を使用して実際にLLMで生成
    const result = await generateAIScript(script, project, options);

    if (result.success) {
      return result.structuredContent;
    } else {
      throw new Error(result.error || "台本生成に失敗しました");
    }
  } catch (error) {
    console.error("構造化台本生成エラー:", error);
    // フォールバック: 基本構造を返す
    return createBasicStructure(script, project);
  }
}

/**
 * 基本的な台本構造を生成（フォールバック用）
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @returns {Array} 基本的な構造化台本配列
 */
function createBasicStructure(script, project) {
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
        description: char.role,
      })),
    });
  }

  // 基本的なシーン構造
  const scene1 = {
    id: Date.now() + 3,
    type: "scene",
    title: "シーン1: オープニング",
    content: "物語の始まりです。主人公が登場します。",
    duration: "3分",
    lines: [],
  };

  if (characters.length >= 2) {
    scene1.lines.push({
      id: Date.now() + 4,
      type: "line",
      character: characters[0].name,
      content: `こんにちは、${characters[1].name}さん。`,
      emotion: "親しみやすい",
    });

    scene1.lines.push({
      id: Date.now() + 5,
      type: "line",
      character: characters[1].name,
      content: "はい、こんにちは。今日はいい天気ですね。",
      emotion: "穏やか",
    });
  } else {
    scene1.lines.push({
      id: Date.now() + 4,
      type: "line",
      character: "主人公",
      content: "これは新しい冒険の始まりだ。",
      emotion: "決意",
    });
  }

  scriptContent.push(scene1);

  return scriptContent;
}

/**
 * AI台本生成
 * @param {Object} script - 台本データ
 * @param {Object} project - プロジェクトデータ
 * @param {Object} options - 生成オプション（configId, modelName, scriptSettings）
 * @returns {Promise<Object>} 生成結果
 */
export async function generateAIScript(script, project, options = {}) {
  try {
    const { configId, modelName, scriptSettings = {} } = options;

    console.log("AI台本生成開始:", {
      scriptTitle: script.title,
      projectName: project?.name,
      configId,
      modelName,
      scriptSettings,
    });

    // LLMサービスを使って台本を生成
    const result = await generateScript(project, script, {
      configId,
      modelName,
      scriptSettings,
    });

    // 生成された結果を構造化コンテンツ形式に変換
    const structuredContent = parseGeneratedContent(result, project, script);

    return {
      success: true,
      structuredContent,
      generatedAt: new Date().toISOString(),
      model: modelName,
      config: configId,
    };
  } catch (error) {
    console.error("AI台本生成エラー:", error);
    throw new Error(`AI台本生成に失敗しました: ${error.message}`);
  }
}

/**
 * 生成されたコンテンツを構造化形式に変換
 * @param {string} generatedContent - LLMが生成したコンテンツ
 * @param {Object} project - プロジェクトデータ
 * @param {Object} script - 台本データ
 * @returns {Array} 構造化された台本内容配列
 */
function parseGeneratedContent(generatedContent, project, script) {
  const scriptContent = [];

  // ヘッダー情報を追加
  scriptContent.push({
    id: Date.now() + 1,
    type: "header",
    title: script.title,
    project: project?.name || "未設定",
    description: script.description,
  });

  // キャラクター紹介を追加
  if (project?.characters?.length > 0) {
    scriptContent.push({
      id: Date.now() + 2,
      type: "characters",
      title: "登場キャラクター",
      characters: project.characters.map((char) => ({
        name: char.name,
        description: char.role || char.description,
      })),
    });
  }

  try {
    // LLM出力の構造化されたコンテンツを解析
    const parsedScenes = parseStructuredLLMOutput(generatedContent, project);
    scriptContent.push(...parsedScenes);
  } catch (error) {
    console.warn("LLM出力の解析に失敗、フォールバック処理を実行:", error);
    // フォールバック: 基本的な構造を生成
    const fallbackScenes = createFallbackScenes(
      generatedContent,
      script,
      project
    );
    scriptContent.push(...fallbackScenes);
  }

  return scriptContent;
}

/**
 * 構造化されたLLM出力を解析
 * @param {string} content - LLMが生成したコンテンツ
 * @param {Object} project - プロジェクトデータ
 * @returns {Array} 解析されたシーン配列
 */
function parseStructuredLLMOutput(content, project) {
  const scenes = [];
  let currentSceneId = Date.now() + 100;

  try {
    // JSON形式での出力を試行
    const jsonOutput = tryParseJSON(content);
    if (jsonOutput) {
      return parseJSONScenes(jsonOutput, project, currentSceneId);
    }
  } catch (error) {
    console.debug("JSON解析失敗、マークダウン形式を試行");
  }

  // マークダウン形式の解析
  try {
    return parseMarkdownScenes(content, project, currentSceneId);
  } catch (error) {
    console.debug("マークダウン解析失敗、テキスト形式を試行");
  }

  // プレーンテキスト形式の解析
  return parseTextScenes(content, project, currentSceneId);
}

/**
 * JSON形式のLLM出力を解析
 */
function parseJSONScenes(jsonData, project, startId) {
  const scenes = [];

  if (jsonData.scenes && Array.isArray(jsonData.scenes)) {
    jsonData.scenes.forEach((sceneData, index) => {
      const scene = {
        id: startId + index * 100,
        type: "scene",
        title: sceneData.title || `シーン${index + 1}`,
        content: sceneData.description || sceneData.content || "",
        duration: sceneData.duration || "3分",
        lines: [],
      };

      // セリフを解析
      if (sceneData.lines && Array.isArray(sceneData.lines)) {
        sceneData.lines.forEach((lineData, lineIndex) => {
          scene.lines.push({
            id: startId + index * 100 + lineIndex + 1,
            type: "line",
            character: lineData.character || lineData.speaker || "ナレーター",
            content: lineData.content || lineData.text || "",
            emotion: lineData.emotion || lineData.mood || "普通",
          });
        });
      }

      scenes.push(scene);
    });
  }

  return scenes;
}

/**
 * マークダウン形式のLLM出力を解析
 */
function parseMarkdownScenes(content, project, startId) {
  const scenes = [];
  const lines = content.split("\n");
  let currentScene = null;
  let sceneCounter = 0;
  let lineCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // シーンヘッダーの検出 (## シーン1: タイトル 形式)
    const sceneMatch = line.match(/^##\s*(.+?)(?:\s*\((.+?)\))?$/);
    if (sceneMatch) {
      // 前のシーンを保存
      if (currentScene) {
        scenes.push(currentScene);
      }

      // 新しいシーンを開始
      sceneCounter++;
      currentScene = {
        id: startId + sceneCounter * 100,
        type: "scene",
        title: sceneMatch[1].trim(),
        content: "",
        duration: sceneMatch[2] || "3分",
        lines: [],
      };
      lineCounter = 0;
      continue;
    }

    // シーン説明の検出
    if (currentScene && line.startsWith("*") && !line.includes(":")) {
      currentScene.content = line.replace(/^\*\s*/, "");
      continue;
    }

    // セリフの検出 (キャラクター名: セリフ 形式)
    const dialogueMatch = line.match(/^(.+?):\s*(.+?)(?:\s*\[(.+?)\])?$/);
    if (dialogueMatch && currentScene) {
      lineCounter++;
      currentScene.lines.push({
        id: startId + sceneCounter * 100 + lineCounter,
        type: "line",
        character: dialogueMatch[1].trim(),
        content: dialogueMatch[2].trim(),
        emotion: dialogueMatch[3] || "普通",
      });
      continue;
    }

    // ナレーションの検出 (【ナレーション】形式)
    const narrationMatch = line.match(/^【(.+?)】$/);
    if (narrationMatch && currentScene) {
      lineCounter++;
      currentScene.lines.push({
        id: startId + sceneCounter * 100 + lineCounter,
        type: "narration",
        content: narrationMatch[1].trim(),
      });
      continue;
    }
  }

  // 最後のシーンを保存
  if (currentScene) {
    scenes.push(currentScene);
  }

  return scenes;
}

/**
 * プレーンテキスト形式のLLM出力を解析
 */
function parseTextScenes(content, project, startId) {
  const scenes = [];
  const paragraphs = content.split("\n\n").filter((p) => p.trim());

  let sceneCounter = 0;

  paragraphs.forEach((paragraph, index) => {
    const lines = paragraph
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);

    if (lines.length > 0) {
      sceneCounter++;
      const scene = {
        id: startId + sceneCounter * 100,
        type: "scene",
        title: `シーン${sceneCounter}`,
        content: lines[0], // 最初の行をシーン説明とする
        duration: "3分",
        lines: [],
      };

      // 残りの行をセリフとして処理
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const colonIndex = line.indexOf(":");

        if (colonIndex > 0 && colonIndex < 20) {
          // キャラクター名は20文字以内
          const character = line.substring(0, colonIndex).trim();
          const content = line.substring(colonIndex + 1).trim();

          if (content) {
            scene.lines.push({
              id: startId + sceneCounter * 100 + i,
              type: "line",
              character: character,
              content: content,
              emotion: "普通",
            });
          }
        } else {
          // キャラクター名がない場合はナレーションとして扱う
          scene.lines.push({
            id: startId + sceneCounter * 100 + i,
            type: "narration",
            content: line,
          });
        }
      }

      scenes.push(scene);
    }
  });

  return scenes;
}

/**
 * JSON文字列の解析を試行
 */
function tryParseJSON(content) {
  try {
    // JSONブロックを抽出（```json...```形式）
    const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonBlockMatch) {
      return JSON.parse(jsonBlockMatch[1]);
    }

    // 純粋なJSON形式を試行
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * フォールバック用のシーン生成
 */
function createFallbackScenes(content, script, project) {
  const scenes = [];
  const sceneCount = script.scriptSettings?.sceneCount || 3;
  const contentParagraphs = content.split("\n\n").filter((p) => p.trim());

  for (let i = 1; i <= sceneCount; i++) {
    const scene = {
      id: Date.now() + 1000 + i,
      type: "scene",
      title: `シーン${i}`,
      content: contentParagraphs[i - 1] || `シーン${i}の内容`,
      duration: script.scriptSettings?.averageSceneDuration || "3分",
      lines: [],
    };

    // サンプルセリフを追加
    if (project?.characters?.length > 0) {
      scene.lines.push({
        id: Date.now() + 1000 + i * 10 + 1,
        type: "line",
        character: project.characters[0].name,
        content: `シーン${i}でのセリフです。`,
        emotion: "普通",
      });

      if (project.characters.length > 1) {
        scene.lines.push({
          id: Date.now() + 1000 + i * 10 + 2,
          type: "line",
          character: project.characters[1].name,
          content: "はい、そうですね。",
          emotion: "同意",
        });
      }
    }

    scenes.push(scene);
  }

  return scenes;
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

/**
 * 台本の複製
 * @param {Object} script - 複製元の台本データ
 * @param {Function} getMaxScriptId - 新しいID取得関数
 * @param {Function} addScript - 台本追加関数
 * @returns {Promise<Object>} 複製された台本データ
 */
export async function duplicateScript(script, getMaxScriptId, addScript) {
  try {
    const maxId = await getMaxScriptId();
    const duplicatedScript = JSON.parse(JSON.stringify(script));
    duplicatedScript.id = maxId + 1;
    duplicatedScript.title += " (複製)";
    duplicatedScript.createdAt = new Date().toISOString();
    duplicatedScript.updatedAt = new Date().toISOString();

    const newScript = await addScript(duplicatedScript);
    return newScript;
  } catch (error) {
    console.error("台本の複製に失敗しました:", error);
    throw new Error("台本の複製に失敗しました");
  }
}
