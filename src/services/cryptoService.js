/**
 * 暗号化サービス
 * Web Crypto APIを使用してAPIキーを暗号化/復号化
 */

// 開発用固定パスワード（本番では環境変数や設定から取得）
const DEV_PASSWORD = "ai-movie-generator-dev-key-2025";

/**
 * パスワードから暗号化キーを導出
 * @param {string} password - パスワード
 * @param {Uint8Array} salt - ソルト
 * @returns {Promise<CryptoKey>} 暗号化キー
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * データを暗号化
 * @param {string} plaintext - 平文
 * @param {string} password - パスワード（省略時は開発用固定パスワード）
 * @returns {Promise<string>} 暗号化されたデータ（Base64エンコード）
 */
export async function encrypt(plaintext, password = DEV_PASSWORD) {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // ランダムなソルトとIVを生成
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // キーを導出
    const key = await deriveKey(password, salt);

    // 暗号化
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    // ソルト + IV + 暗号化データを結合
    const combined = new Uint8Array(
      salt.length + iv.length + encrypted.byteLength
    );
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Base64エンコードして返す
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("暗号化に失敗しました:", error);
    throw new Error("データの暗号化に失敗しました");
  }
}

/**
 * データを復号化
 * @param {string} encryptedData - 暗号化されたデータ（Base64エンコード）
 * @param {string} password - パスワード（省略時は開発用固定パスワード）
 * @returns {Promise<string>} 復号化された平文
 */
export async function decrypt(encryptedData, password = DEV_PASSWORD) {
  try {
    // Base64デコード
    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    // ソルト、IV、暗号化データを分離
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    // キーを導出
    const key = await deriveKey(password, salt);

    // 復号化
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encrypted
    );

    // テキストに変換して返す
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("復号化に失敗しました:", error);
    throw new Error("データの復号化に失敗しました");
  }
}

/**
 * 暗号化されたデータかどうかを確認
 * @param {string} data - 確認するデータ
 * @returns {boolean} 暗号化されたデータの場合true
 */
export function isEncrypted(data) {
  try {
    // Base64形式で、十分な長さがあるかチェック
    const decoded = atob(data);
    return decoded.length >= 28; // ソルト(16) + IV(12) + 最小暗号化データ
  } catch {
    return false;
  }
}

/**
 * Web Crypto APIが利用可能かチェック
 * @returns {boolean} 利用可能な場合true
 */
export function isCryptoSupported() {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.subtle !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  );
}
