/**
 * LocalStorage操作のユーティリティ関数
 */

const STORAGE_KEYS = {
  SCRIPTS: "aimovie_generated_scripts",
  PROJECTS: "aimovie_projects",
  SETTINGS: "aimovie_settings",
};

/**
 * 台本データの取得
 * @returns {Array} 台本データの配列
 */
export function getScripts() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("台本データの読み込みに失敗しました:", error);
    return [];
  }
}

/**
 * 台本データの保存
 * @param {Array} scripts - 台本データの配列
 */
export function saveScripts(scripts) {
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
 * @returns {Object|null} 台本データまたはnull
 */
export function getScript(index) {
  const scripts = getScripts();
  if (index >= 0 && index < scripts.length) {
    return scripts[index];
  }
  return null;
}

/**
 * 特定のインデックスの台本データを更新
 * @param {number} index - 台本のインデックス
 * @param {Object} scriptData - 更新する台本データ
 */
export function updateScript(index, scriptData) {
  const scripts = getScripts();
  if (index >= 0 && index < scripts.length) {
    scripts[index] = { ...scripts[index], ...scriptData };
    saveScripts(scripts);
  } else {
    throw new Error("指定された台本が見つかりません");
  }
}

/**
 * 新しい台本を追加
 * @param {Object} scriptData - 台本データ
 * @returns {number} 追加された台本のインデックス
 */
export function addScript(scriptData) {
  const scripts = getScripts();
  const newScript = {
    id: Date.now(), // 一意のIDを生成
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "draft",
    ...scriptData,
  };
  scripts.push(newScript);
  saveScripts(scripts);
  return scripts.length - 1; // 新しく追加された台本のインデックスを返す
}

/**
 * 台本を削除
 * @param {number} index - 削除する台本のインデックス
 */
export function deleteScript(index) {
  const scripts = getScripts();
  if (index >= 0 && index < scripts.length) {
    scripts.splice(index, 1);
    saveScripts(scripts);
  } else {
    throw new Error("指定された台本が見つかりません");
  }
}

/**
 * プロジェクトデータの取得
 * @returns {Array} プロジェクトデータの配列
 */
export function getProjects() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("プロジェクトデータの読み込みに失敗しました:", error);
    return [];
  }
}

/**
 * プロジェクトデータの保存
 * @param {Array} projects - プロジェクトデータの配列
 */
export function saveProjects(projects) {
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
 * @returns {Object|null} プロジェクトデータまたはnull
 */
export function getProject(projectId) {
  const projects = getProjects();
  return (
    projects.find(
      (p) => String(p.id) === String(projectId) || p.id === projectId
    ) || null
  );
}

/**
 * 新しいプロジェクトを追加
 * @param {Object} projectData - プロジェクトデータ
 * @returns {Object} 追加されたプロジェクトデータ
 */
export function addProject(projectData) {
  const projects = getProjects();
  const newProject = {
    id: Date.now(), // 一意のIDを生成
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...projectData,
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

/**
 * プロジェクトを更新
 * @param {string|number} projectId - プロジェクトID
 * @param {Object} projectData - 更新するプロジェクトデータ
 */
export function updateProject(projectId, projectData) {
  const projects = getProjects();
  const index = projects.findIndex(
    (p) => String(p.id) === String(projectId) || p.id === projectId
  );

  if (index >= 0) {
    projects[index] = {
      ...projects[index],
      ...projectData,
      updatedAt: new Date().toISOString(),
    };
    saveProjects(projects);
  } else {
    throw new Error("指定されたプロジェクトが見つかりません");
  }
}

/**
 * プロジェクトを削除
 * @param {string|number} projectId - プロジェクトID
 */
export function deleteProject(projectId) {
  const projects = getProjects();
  const index = projects.findIndex(
    (p) => String(p.id) === String(projectId) || p.id === projectId
  );

  if (index >= 0) {
    projects.splice(index, 1);
    saveProjects(projects);
  } else {
    throw new Error("指定されたプロジェクトが見つかりません");
  }
}

/**
 * 設定データの取得
 * @returns {Object} 設定データ
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("設定データの読み込みに失敗しました:", error);
    return {};
  }
}

/**
 * 設定データの保存
 * @param {Object} settings - 設定データ
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("設定データの保存に失敗しました:", error);
    throw new Error("設定データの保存に失敗しました");
  }
}

/**
 * すべてのデータをクリア（開発用）
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * データのエクスポート
 * @returns {Object} すべてのデータ
 */
export function exportData() {
  return {
    scripts: getScripts(),
    projects: getProjects(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
}

/**
 * データのインポート
 * @param {Object} data - インポートするデータ
 */
export function importData(data) {
  try {
    if (data.scripts) saveScripts(data.scripts);
    if (data.projects) saveProjects(data.projects);
    if (data.settings) saveSettings(data.settings);
  } catch (error) {
    console.error("データのインポートに失敗しました:", error);
    throw new Error("データのインポートに失敗しました");
  }
}
