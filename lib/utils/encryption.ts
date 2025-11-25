/**
 * Web Crypto APIを使った機密データの暗号化/復号化
 *
 * セキュリティ上の注意:
 * - この実装は基本的なクライアントサイド暗号化の例
 */

// 暗号化キーの生成（実際は安全に管理する必要がある）
async function getEncryptionKey(): Promise<CryptoKey> {
  // 本番環境では、ユーザー認証情報から派生させるなど、より安全な方法でキーを生成すること
  const password = 'user-session-key-' + sessionStorage.getItem('register_session_id')

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('smart-register-salt'), // 本来はランダムなsaltを使うべき
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * 文字列を暗号化
 */
export async function encryptString(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    // ランダムなIV（初期化ベクトル）を生成
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)

    // IVと暗号化データを結合してBase64エンコード
    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedData), iv.length)

    return btoa(String.fromCharCode(...combined))
  } catch (error) {
    console.error('Encryption failed:', error)
    throw new Error('データの暗号化に失敗しました')
  }
}

/**
 * 暗号化された文字列を復号化
 */
export async function decryptString(encrypted: string): Promise<string> {
  try {
    const key = await getEncryptionKey()

    // Base64デコード
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0))

    // IVと暗号化データを分離
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('データの復号化に失敗しました')
  }
}
