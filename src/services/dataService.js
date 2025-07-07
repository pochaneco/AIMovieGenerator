/**
 * データ操作サービス
 * LocalStorage実装だが、将来的にはAPI呼び出しに置き換え可能
 */

const STORAGE_KEYS = {
  SCRIPTS: "aimovie_generated_scripts",
  PROJECTS: "aimovie_projects",
  SETTINGS: "aimovie_settings",
};

// API遅延をシミュレート（本番では削除可能）
const SIMULATE_DELAY = 50;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 台本データの取得
 * @returns {Promise<Array>} 台本データの配列
 */
export async function getScripts() {
  await delay(SIMULATE_DELAY);

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("台本データの読み込みに失敗しました:", error);
    throw new Error("台本データの読み込みに失敗しました");
  }
}

/**
 * 台本データの保存
 * @param {Array} scripts - 台本データの配列
 * @returns {Promise<void>}
 */
export async function saveScripts(scripts) {
  await delay(SIMULATE_DELAY);

  try {
    localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
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
  const scripts = await getScripts();
  if (index >= 0 && index < scripts.length) {
    return scripts[index];
  }
  return null;
}

/**
 * 特定のインデックスの台本データを更新
 * @param {number} index - 台本のインデックス
 * @param {Object} scriptData - 更新する台本データ
 * @returns {Promise<Object>} 更新された台本データ
 */
export async function updateScript(index, scriptData) {
  const scripts = await getScripts();

  if (index >= 0 && index < scripts.length) {
    const updatedScript = {
      ...scripts[index],
      ...scriptData,
      updatedAt: new Date().toISOString(),
    };
    scripts[index] = updatedScript;
    await saveScripts(scripts);
    return updatedScript;
  } else {
    throw new Error("指定された台本が見つかりません");
  }
}

/**
 * 新しい台本を作成
 * @param {Object} scriptData - 台本データ
 * @returns {Promise<{script: Object, index: number}>} 作成された台本データとインデックス
 */
export async function createScript(scriptData) {
  const scripts = await getScripts();
  const newScript = {
    id: Date.now(), // 一意のIDを生成
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    ...scriptData,
  };

  scripts.push(newScript);
  await saveScripts(scripts);

  return {
    script: newScript,
    index: scripts.length - 1,
  };
}

/**
 * 台本を削除
 * @param {number} index - 削除する台本のインデックス
 * @returns {Promise<void>}
 */
export async function deleteScript(index) {
  const scripts = await getScripts();

  if (index >= 0 && index < scripts.length) {
    scripts.splice(index, 1);
    await saveScripts(scripts);
  } else {
    throw new Error("指定された台本が見つかりません");
  }
}

/**
 * プロジェクトデータの取得
 * @returns {Promise<Array>} プロジェクトデータの配列
 */
export async function getProjects() {
  await delay(SIMULATE_DELAY);

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("プロジェクトデータの読み込みに失敗しました:", error);
    throw new Error("プロジェクトデータの読み込みに失敗しました");
  }
}

/**
 * プロジェクトデータの保存
 * @param {Array} projects - プロジェクトデータの配列
 * @returns {Promise<void>}
 */
export async function saveProjects(projects) {
  await delay(SIMULATE_DELAY);

  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
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
  const projects = await getProjects();
  return (
    projects.find(
      (p) => String(p.id) === String(projectId) || p.id === projectId
    ) || null
  );
}

/**
 * 新しいプロジェクトを作成
 * @param {Object} projectData - プロジェクトデータ
 * @returns {Promise<Object>} 作成されたプロジェクトデータ
 */
export async function createProject(projectData) {
  const projects = await getProjects();
  const newProject = {
    id: Date.now(), // 一意のIDを生成
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...projectData,
  };

  projects.push(newProject);
  await saveProjects(projects);
  return newProject;
}

/**
 * プロジェクトを更新
 * @param {string|number} projectId - プロジェクトID
 * @param {Object} projectData - 更新するプロジェクトデータ
 * @returns {Promise<Object>} 更新されたプロジェクトデータ
 */
export async function updateProject(projectId, projectData) {
  const projects = await getProjects();
  const index = projects.findIndex(
    (p) => String(p.id) === String(projectId) || p.id === projectId
  );

  if (index >= 0) {
    const updatedProject = {
      ...projects[index],
      ...projectData,
      updatedAt: new Date().toISOString(),
    };
    projects[index] = updatedProject;
    await saveProjects(projects);
    return updatedProject;
  } else {
    throw new Error("指定されたプロジェクトが見つかりません");
  }
}

/**
 * プロジェクトを削除
 * @param {string|number} projectId - プロジェクトID
 * @returns {Promise<void>}
 */
export async function deleteProject(projectId) {
  const projects = await getProjects();
  const index = projects.findIndex(
    (p) => String(p.id) === String(projectId) || p.id === projectId
  );

  if (index >= 0) {
    projects.splice(index, 1);
    await saveProjects(projects);
  } else {
    throw new Error("指定されたプロジェクトが見つかりません");
  }
}

/**
 * 設定データの取得
 * @returns {Promise<Object>} 設定データ
 */
export async function getSettings() {
  await delay(SIMULATE_DELAY);

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
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

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
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
  const settings = await getSettings();
  return settings[key] !== undefined ? settings[key] : defaultValue;
}

/**
 * 特定の設定値を保存
 * @param {string} key - 設定キー
 * @param {*} value - 設定値
 * @returns {Promise<void>}
 */
export async function saveSetting(key, value) {
  const settings = await getSettings();
  settings[key] = value;
  await saveSettings(settings);
}

/**
 * すべてのデータをクリア（開発用）
 * @returns {Promise<void>}
 */
export async function clearAllData() {
  await delay(SIMULATE_DELAY);

  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * データのエクスポート
 * @returns {Promise<Object>} すべてのデータ
 */
export async function exportData() {
  const [scripts, projects, settings] = await Promise.all([
    getScripts(),
    getProjects(),
    getSettings(),
  ]);

  return {
    scripts,
    projects,
    settings,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * データのインポート
 * @param {Object} data - インポートするデータ
 * @returns {Promise<void>}
 */
export async function importData(data) {
  try {
    const promises = [];

    if (data.scripts) promises.push(saveScripts(data.scripts));
    if (data.projects) promises.push(saveProjects(data.projects));
    if (data.settings) promises.push(saveSettings(data.settings));

    await Promise.all(promises);
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
    const [scripts, projects, settings] = await Promise.all([
      getScripts(),
      getProjects(),
      getSettings(),
    ]);

    return {
      status: "healthy",
      data: {
        scriptsCount: scripts.length,
        projectsCount: projects.length,
        hasSettings: Object.keys(settings).length > 0,
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
