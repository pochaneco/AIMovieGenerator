/**
 * データ操作サービス
 * IndexedDB + Dexie.js実装、APIキー暗号化対応
 */

import { db, initializeDatabase } from "./databaseService.js";
import { encrypt, decrypt, isEncrypted } from "./cryptoService.js";

// API遅延をシミュレート（本番では削除可能）
const SIMULATE_DELAY = 50;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// データベース初期化フラグ
let isInitialized = false;

/**
 * データベースを初期化（初回のみ実行）
 */
async function ensureInitialized() {
  if (!isInitialized) {
    await initializeDatabase();
    isInitialized = true;
  }
}

/**
 * 台本データの取得
 * @returns {Promise<Array>} 台本データの配列
 */
export async function getScripts() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const scripts = await db.scripts.orderBy("createdAt").reverse().toArray();
    return scripts;
  } catch (error) {
    console.error("台本データの読み込みに失敗しました:", error);
    throw new Error("台本データの読み込みに失敗しました");
  }
}

/**
 * 台本データの保存
 * @param {Array} scripts - 台本データの配列（後方互換性のため）
 * @returns {Promise<void>}
 */
export async function saveScripts(scripts) {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    // 個別のcreate/updateメソッドの使用を推奨するため、このメソッドは非推奨
    console.warn(
      "saveScripts()は非推奨です。createScript()またはupdateScript()を使用してください"
    );

    // 既存データをクリアして新しいデータを挿入
    await db.transaction("rw", db.scripts, async () => {
      await db.scripts.clear();
      await db.scripts.bulkAdd(scripts);
    });
  } catch (error) {
    console.error("台本データの保存に失敗しました:", error);
    throw new Error("台本データの保存に失敗しました");
  }
}

/**
 * 特定のインデックスの台本データを取得
 * @param {number} index - 台本のインデックス
 * @returns {Promise<Object|null>} 台本データまたはnull
 */
export async function getScript(index) {
  await ensureInitialized();

  try {
    const scripts = await db.scripts.orderBy("createdAt").reverse().toArray();
    if (index >= 0 && index < scripts.length) {
      return scripts[index];
    }
    return null;
  } catch (error) {
    console.error("台本データの取得に失敗しました:", error);
    throw new Error("台本データの取得に失敗しました");
  }
}

/**
 * 特定のインデックスの台本データを更新
 * @param {number} index - 台本のインデックス
 * @param {Object} scriptData - 更新する台本データ
 * @returns {Promise<Object>} 更新された台本データ
 */
export async function updateScript(index, scriptData) {
  await ensureInitialized();

  try {
    const scripts = await db.scripts.orderBy("createdAt").reverse().toArray();

    if (index >= 0 && index < scripts.length) {
      const scriptToUpdate = scripts[index];
      const updatedScript = {
        ...scriptToUpdate,
        ...scriptData,
        updatedAt: new Date().toISOString(),
      };

      // IndexedDB保存用にシリアライズ可能な形にする
      const safeScriptData = JSON.parse(JSON.stringify(updatedScript));
      await db.scripts.update(scriptToUpdate.id, safeScriptData);
      return safeScriptData;
    } else {
      throw new Error("指定された台本が見つかりません");
    }
  } catch (error) {
    console.error("台本データの更新に失敗しました:", error);
    throw new Error("台本データの更新に失敗しました");
  }
}

/**
 * 新しい台本を作成
 * @param {Object} scriptData - 台本データ
 * @returns {Promise<{script: Object, index: number}>} 作成された台本データとインデックス
 */
export async function createScript(scriptData) {
  await ensureInitialized();

  try {
    const newScript = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      ...scriptData,
    };

    // IndexedDB保存用にシリアライズ可能な形にする
    const safeScriptData = JSON.parse(JSON.stringify(newScript));
    const id = await db.scripts.add(safeScriptData);
    const createdScript = { ...safeScriptData, id };

    // インデックスを計算（新しいものが先頭になる）
    const allScripts = await db.scripts
      .orderBy("createdAt")
      .reverse()
      .toArray();
    const index = allScripts.findIndex((script) => script.id === id);

    return {
      script: createdScript,
      index: index,
    };
  } catch (error) {
    console.error("台本データの作成に失敗しました:", error);
    throw new Error("台本データの作成に失敗しました");
  }
}

/**
 * 台本を削除
 * @param {number} index - 削除する台本のインデックス
 * @returns {Promise<void>}
 */
export async function deleteScript(index) {
  await ensureInitialized();

  try {
    const scripts = await db.scripts.orderBy("createdAt").reverse().toArray();

    if (index >= 0 && index < scripts.length) {
      const scriptToDelete = scripts[index];
      await db.scripts.delete(scriptToDelete.id);
    } else {
      throw new Error("指定された台本が見つかりません");
    }
  } catch (error) {
    console.error("台本データの削除に失敗しました:", error);
    throw new Error("台本データの削除に失敗しました");
  }
}

/**
 * 新しい台本を追加
 * @param {Object} scriptData - 追加する台本データ
 * @returns {Promise<Object>} 追加された台本データ
 */
export async function addScript(scriptData) {
  await ensureInitialized();

  try {
    const id = await db.scripts.add({
      ...scriptData,
      createdAt: new Date(),
    });
    const newScript = await db.scripts.get(id);
    return newScript;
  } catch (error) {
    console.error("台本データの追加に失敗しました:", error);
    throw new Error("台本データの追加に失敗しました");
  }
}

/**
 * プロジェクトデータの取得
 * @returns {Promise<Array>} プロジェクトデータの配列
 */
export async function getProjects() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const projects = await db.projects.orderBy("createdAt").reverse().toArray();
    return projects;
  } catch (error) {
    console.error("プロジェクトデータの読み込みに失敗しました:", error);
    throw new Error("プロジェクトデータの読み込みに失敗しました");
  }
}

/**
 * プロジェクトデータの保存
 * @param {Array} projects - プロジェクトデータの配列（後方互換性のため）
 * @returns {Promise<void>}
 */
export async function saveProjects(projects) {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    console.warn(
      "saveProjects()は非推奨です。createProject()またはupdateProject()を使用してください"
    );

    await db.transaction("rw", db.projects, async () => {
      await db.projects.clear();
      await db.projects.bulkAdd(projects);
    });
  } catch (error) {
    console.error("プロジェクトデータの保存に失敗しました:", error);
    throw new Error("プロジェクトデータの保存に失敗しました");
  }
}

/**
 * 特定のIDのプロジェクトを取得
 * @param {string|number} projectId - プロジェクトID
 * @returns {Promise<Object|null>} プロジェクトデータまたはnull
 */
export async function getProject(projectId) {
  await ensureInitialized();

  try {
    const project = await db.projects.get(parseInt(projectId));
    return project || null;
  } catch (error) {
    console.error("プロジェクトデータの取得に失敗しました:", error);
    throw new Error("プロジェクトデータの取得に失敗しました");
  }
}

/**
 * 新しいプロジェクトを作成
 * @param {Object} projectData - プロジェクトデータ
 * @returns {Promise<Object>} 作成されたプロジェクトデータ
 */
export async function createProject(projectData) {
  await ensureInitialized();

  try {
    const newProject = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...projectData,
    };

    // IndexedDB保存用にシリアライズ可能な形にする
    const safeProjectData = JSON.parse(JSON.stringify(newProject));
    const id = await db.projects.add(safeProjectData);
    return { ...safeProjectData, id };
  } catch (error) {
    console.error("プロジェクトデータの作成に失敗しました:", error);
    throw new Error("プロジェクトデータの作成に失敗しました");
  }
}

/**
 * プロジェクトを更新
 * @param {string|number} projectId - プロジェクトID
 * @param {Object} projectData - 更新するプロジェクトデータ
 * @returns {Promise<Object>} 更新されたプロジェクトデータ
 */
export async function updateProject(projectId, projectData) {
  await ensureInitialized();

  try {
    const id = parseInt(projectId);
    const existingProject = await db.projects.get(id);

    if (!existingProject) {
      throw new Error("指定されたプロジェクトが見つかりません");
    }

    const updatedProject = {
      ...existingProject,
      ...projectData,
      updatedAt: new Date().toISOString(),
    };

    // IndexedDB保存用にシリアライズ可能な形にする
    const safeProjectData = JSON.parse(JSON.stringify(updatedProject));
    await db.projects.update(id, safeProjectData);
    return safeProjectData;
  } catch (error) {
    console.error("プロジェクトデータの更新に失敗しました:", error);
    throw new Error("プロジェクトデータの更新に失敗しました");
  }
}

/**
 * プロジェクトを削除
 * @param {string|number} projectId - プロジェクトID
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
  await ensureInitialized();

  try {
    const id = parseInt(projectId);
    const deletedCount = await db.projects.delete(id);

    if (deletedCount === 0) {
      throw new Error("指定されたプロジェクトが見つかりません");
    }
  } catch (error) {
    console.error("プロジェクトデータの削除に失敗しました:", error);
    throw new Error("プロジェクトデータの削除に失敗しました");
  }
}

/**
 * 設定データの取得
 * @returns {Promise<Object>} 設定データ
 */
export async function getSettings() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const settingsArray = await db.settings.toArray();
    const settings = {};
    settingsArray.forEach((item) => {
      settings[item.key] = item.value;
    });
    return settings;
  } catch (error) {
    console.error("設定データの読み込みに失敗しました:", error);
    throw new Error("設定データの読み込みに失敗しました");
  }
}

/**
 * 設定データの保存
 * @param {Object} settings - 設定データ
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    await db.transaction("rw", db.settings, async () => {
      // 既存の設定をクリア
      await db.settings.clear();

      // 新しい設定を保存
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updatedAt: new Date().toISOString(),
      }));

      await db.settings.bulkAdd(settingsArray);
    });
  } catch (error) {
    console.error("設定データの保存に失敗しました:", error);
    throw new Error("設定データの保存に失敗しました");
  }
}

/**
 * 特定の設定値を取得
 * @param {string} key - 設定キー
 * @param {*} defaultValue - デフォルト値
 * @returns {Promise<*>} 設定値
 */
export async function getSetting(key, defaultValue = null) {
  await ensureInitialized();

  try {
    const setting = await db.settings.get(key);
    return setting ? setting.value : defaultValue;
  } catch (error) {
    console.error("設定値の取得に失敗しました:", error);
    return defaultValue;
  }
}

/**
 * 特定の設定値を保存
 * @param {string} key - 設定キー
 * @param {*} value - 設定値
 * @returns {Promise<void>}
 */
export async function saveSetting(key, value) {
  await ensureInitialized();

  try {
    const settingData = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    };

    // IndexedDB保存用にシリアライズ可能な形にする
    const safeSettingData = JSON.parse(JSON.stringify(settingData));
    await db.settings.put(safeSettingData);
  } catch (error) {
    console.error("設定値の保存に失敗しました:", error);
    throw new Error("設定値の保存に失敗しました");
  }
}

/**
 * LLM設定データの取得
 * @returns {Promise<Array>} LLM設定データの配列
 */
export async function getLLMConfigs() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const configs = await db.llmConfigs
      .orderBy("createdAt")
      .reverse()
      .toArray();

    // APIキーを復号化
    const decryptedConfigs = await Promise.all(
      configs.map(async (config) => {
        if (config.apiKey && isEncrypted(config.apiKey)) {
          try {
            const decryptedApiKey = await decrypt(config.apiKey);
            return { ...config, apiKey: decryptedApiKey };
          } catch (error) {
            console.error("APIキーの復号化に失敗しました:", error);
            return { ...config, apiKey: "" }; // 復号化失敗時は空文字
          }
        }
        return config;
      })
    );

    return decryptedConfigs;
  } catch (error) {
    console.error("LLM設定データの読み込みに失敗しました:", error);
    throw new Error("LLM設定データの読み込みに失敗しました");
  }
}

/**
 * LLM設定データの保存
 * @param {Array} configs - LLM設定データの配列（後方互換性のため）
 * @returns {Promise<void>}
 */
export async function saveLLMConfigs(configs) {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    console.warn(
      "saveLLMConfigs()は非推奨です。saveLLMConfig()を使用してください"
    );

    // APIキーを暗号化
    const encryptedConfigs = await Promise.all(
      configs.map(async (config) => {
        if (config.apiKey && !isEncrypted(config.apiKey)) {
          const encryptedApiKey = await encrypt(config.apiKey);
          return { ...config, apiKey: encryptedApiKey };
        }
        return config;
      })
    );

    await db.transaction("rw", db.llmConfigs, async () => {
      await db.llmConfigs.clear();
      await db.llmConfigs.bulkAdd(encryptedConfigs);
    });
  } catch (error) {
    console.error("LLM設定データの保存に失敗しました:", error);
    throw new Error("LLM設定データの保存に失敗しました");
  }
}

/**
 * LLM設定を保存
 * @param {Object} config - LLM設定データ
 * @returns {Promise<Object>} 保存されたLLM設定データ
 */
export async function saveLLMConfig(config) {
  await ensureInitialized();

  try {
    // APIキーを暗号化
    const encryptedApiKey =
      config.apiKey && !isEncrypted(config.apiKey)
        ? await encrypt(config.apiKey)
        : config.apiKey;

    const newConfig = {
      id: config.id || Date.now().toString(),
      name: config.name,
      provider: config.provider,
      apiKey: encryptedApiKey,
      defaultModel: config.defaultModel,
      isActive: config.isActive || false,
      createdAt: config.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 既存の設定があるかチェック
    const existingConfig = await db.llmConfigs.get(newConfig.id);

    // IndexedDB保存用にシリアライズ可能な形にする
    const safeConfigData = JSON.parse(JSON.stringify(newConfig));

    if (existingConfig) {
      await db.llmConfigs.update(newConfig.id, safeConfigData);
    } else {
      await db.llmConfigs.add(safeConfigData);
    }

    // 復号化された状態で返す
    const decryptedConfig = { ...safeConfigData };
    if (decryptedConfig.apiKey && isEncrypted(decryptedConfig.apiKey)) {
      decryptedConfig.apiKey = await decrypt(decryptedConfig.apiKey);
    }

    return decryptedConfig;
  } catch (error) {
    console.error("LLM設定の保存に失敗しました:", error);
    throw new Error("LLM設定の保存に失敗しました");
  }
}

/**
 * LLM設定を削除
 * @param {string} configId - 削除するLLM設定ID
 * @returns {Promise<void>}
 */
export async function deleteLLMConfig(configId) {
  await ensureInitialized();

  try {
    const deletedCount = await db.llmConfigs.delete(configId);

    if (deletedCount === 0) {
      throw new Error("指定されたLLM設定が見つかりません");
    }
  } catch (error) {
    console.error("LLM設定の削除に失敗しました:", error);
    throw new Error("LLM設定の削除に失敗しました");
  }
}

/**
 * アクティブなLLM設定IDを取得
 * @returns {Promise<string|null>} アクティブなLLM設定ID
 */
export async function getActiveLLMConfigId() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const configs = await db.llmConfigs.toArray();
    const activeConfig = configs.find((config) => config.isActive === true);
    return activeConfig ? activeConfig.id : null;
  } catch (error) {
    console.error("アクティブLLM設定IDの読み込みに失敗しました:", error);
    throw new Error("アクティブLLM設定IDの読み込みに失敗しました");
  }
}

/**
 * アクティブなLLM設定IDを保存
 * @param {string} configId - アクティブにするLLM設定ID
 * @returns {Promise<void>}
 */
export async function saveActiveLLMConfigId(configId) {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    await db.transaction("rw", db.llmConfigs, async () => {
      // 全ての設定を非アクティブに
      await db.llmConfigs.toCollection().modify({ isActive: false });

      // 指定された設定をアクティブに
      if (configId) {
        await db.llmConfigs.update(configId, { isActive: true });
      }
    });
  } catch (error) {
    console.error("アクティブLLM設定IDの保存に失敗しました:", error);
    throw new Error("アクティブLLM設定IDの保存に失敗しました");
  }
}

/**
 * アクティブなLLM設定を取得
 * @returns {Promise<Object|null>} アクティブなLLM設定データまたはnull
 */
export async function getActiveLLMConfig() {
  await ensureInitialized();

  try {
    const configs = await db.llmConfigs.toArray();
    const activeConfig = configs.find((config) => config.isActive === true);

    if (!activeConfig) return null;

    // APIキーを復号化
    if (activeConfig.apiKey && isEncrypted(activeConfig.apiKey)) {
      try {
        const decryptedApiKey = await decrypt(activeConfig.apiKey);
        return { ...activeConfig, apiKey: decryptedApiKey };
      } catch (error) {
        console.error("APIキーの復号化に失敗しました:", error);
        return { ...activeConfig, apiKey: "" };
      }
    }

    return activeConfig;
  } catch (error) {
    console.error("アクティブLLM設定の取得に失敗しました:", error);
    return null;
  }
}

/**
 * アクティブなLLM設定を設定
 * @param {string} configId - アクティブにするLLM設定ID
 * @returns {Promise<void>}
 */
export async function setActiveLLMConfig(configId) {
  await saveActiveLLMConfigId(configId);
}

/**
 * LLMデータをクリア
 * @returns {Promise<void>}
 */
export async function clearLLMData() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    await db.llmConfigs.clear();
    await db.secureData.clear();
  } catch (error) {
    console.error("LLMデータのクリアに失敗しました:", error);
    throw new Error("LLMデータのクリアに失敗しました");
  }
}

/**
 * LLMデータの保存状態を取得
 * @returns {Promise<string>} 'persistent' | 'session' | 'none'
 */
export async function getLLMDataStorageType() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    const configCount = await db.llmConfigs.count();
    return configCount > 0 ? "persistent" : "none";
  } catch (error) {
    console.error("LLMデータ保存状態の確認に失敗しました:", error);
    return "none";
  }
}

/**
 * すべてのデータをクリア（開発用）
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  await delay(SIMULATE_DELAY);
  await ensureInitialized();

  try {
    await db.transaction(
      "rw",
      [db.scripts, db.projects, db.settings, db.llmConfigs, db.secureData],
      async () => {
        await db.scripts.clear();
        await db.projects.clear();
        await db.settings.clear();
        await db.llmConfigs.clear();
        await db.secureData.clear();
      }
    );
  } catch (error) {
    console.error("全データのクリアに失敗しました:", error);
    throw new Error("全データのクリアに失敗しました");
  }
}

/**
 * データのエクスポート
 * @returns {Promise<Object>} すべてのデータ
 */
export async function exportData() {
  await ensureInitialized();

  try {
    const [scripts, projects, settings, llmConfigs] = await Promise.all([
      getScripts(),
      getProjects(),
      getSettings(),
      getLLMConfigs(), // 復号化されたデータを取得
    ]);

    return {
      scripts,
      projects,
      settings,
      llmConfigs, // 注意: APIキーが含まれるため、エクスポート時は慎重に扱う
      exportedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("データのエクスポートに失敗しました:", error);
    throw new Error("データのエクスポートに失敗しました");
  }
}

/**
 * データのインポート
 * @param {Object} data - インポートするデータ
 * @returns {Promise<void>}
 */
export async function importData(data) {
  await ensureInitialized();

  try {
    await db.transaction(
      "rw",
      [db.scripts, db.projects, db.settings, db.llmConfigs],
      async () => {
        if (data.scripts) {
          await db.scripts.clear();
          await db.scripts.bulkAdd(data.scripts);
        }

        if (data.projects) {
          await db.projects.clear();
          await db.projects.bulkAdd(data.projects);
        }

        if (data.settings) {
          await db.settings.clear();
          const settingsArray = Object.entries(data.settings).map(
            ([key, value]) => ({
              key,
              value,
              updatedAt: new Date().toISOString(),
            })
          );
          await db.settings.bulkAdd(settingsArray);
        }

        if (data.llmConfigs) {
          await db.llmConfigs.clear();
          // APIキーを暗号化してインポート
          const encryptedConfigs = await Promise.all(
            data.llmConfigs.map(async (config) => {
              if (config.apiKey && !isEncrypted(config.apiKey)) {
                const encryptedApiKey = await encrypt(config.apiKey);
                return { ...config, apiKey: encryptedApiKey };
              }
              return config;
            })
          );
          await db.llmConfigs.bulkAdd(encryptedConfigs);
        }
      }
    );
  } catch (error) {
    console.error("データのインポートに失敗しました:", error);
    throw new Error("データのインポートに失敗しました");
  }
}

/**
 * データベースの健全性チェック
 * @returns {Promise<Object>} チェック結果
 */
export async function healthCheck() {
  try {
    await ensureInitialized();

    const [scriptsCount, projectsCount, settingsCount, llmConfigsCount] =
      await Promise.all([
        db.scripts.count(),
        db.projects.count(),
        db.settings.count(),
        db.llmConfigs.count(),
      ]);

    return {
      status: "healthy",
      data: {
        scriptsCount,
        projectsCount,
        settingsCount,
        llmConfigsCount,
        storageType: "IndexedDB",
        dbName: db.name,
        version: db.verno,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 現在の最大台本IDを取得
 * @returns {Promise<number>} 最大ID
 */
export async function getMaxScriptId() {
  await ensureInitialized();

  try {
    const scripts = await db.scripts.toArray();
    const maxId = scripts.reduce((max, script) => {
      const id = parseInt(script.id, 10);
      return id > max ? id : max;
    }, 0);
    return maxId;
  } catch (error) {
    console.error("最大台本IDの取得に失敗しました:", error);
    throw new Error("最大台本IDの取得に失敗しました");
  }
}
