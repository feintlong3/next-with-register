import { beforeEach, describe, expect, test } from 'vitest'

import { decryptString, encryptString } from './encryption'

describe('encryption', () => {
  beforeEach(() => {
    // sessionStorage をクリア
    sessionStorage.clear()
    // テスト用のセッションIDを設定
    sessionStorage.setItem('register_session_id', 'test-session-123')
  })

  describe('encryptString / decryptString', () => {
    test('文字列を暗号化して復号化すると元の文字列に戻る', async () => {
      const plaintext = 'Hello, World!'

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    test('日本語文字列を暗号化して復号化できる', async () => {
      const plaintext = 'こんにちは、世界！'

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    test('暗号化された文字列は元の文字列と異なる', async () => {
      const plaintext = 'secret data'

      const encrypted = await encryptString(plaintext)

      expect(encrypted).not.toBe(plaintext)
    })

    test('空文字列を暗号化して復号化できる', async () => {
      const plaintext = ''

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    test('長い文字列を暗号化して復号化できる', async () => {
      const plaintext = 'a'.repeat(10000)

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    test('同じ文字列でも暗号化するたびに異なる結果になる（IV がランダム）', async () => {
      const plaintext = 'same text'

      const encrypted1 = await encryptString(plaintext)
      const encrypted2 = await encryptString(plaintext)

      // 暗号化結果は異なる（ランダムなIVを使用するため）
      expect(encrypted1).not.toBe(encrypted2)

      // ただし、どちらも正しく復号化できる
      expect(await decryptString(encrypted1)).toBe(plaintext)
      expect(await decryptString(encrypted2)).toBe(plaintext)
    })

    test('特殊文字を含む文字列を暗号化して復号化できる', async () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`'

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    test('JSONオブジェクトの文字列を暗号化して復号化できる', async () => {
      const obj = { name: '山田太郎', age: 30, active: true }
      const plaintext = JSON.stringify(obj)

      const encrypted = await encryptString(plaintext)
      const decrypted = await decryptString(encrypted)

      expect(decrypted).toBe(plaintext)
      expect(JSON.parse(decrypted)).toEqual(obj)
    })

    test('不正なデータを復号化しようとするとエラーをスローする', async () => {
      const invalidEncrypted = 'invalid-base64-data'

      await expect(decryptString(invalidEncrypted)).rejects.toThrow('データの復号化に失敗しました')
    })

    test('異なるセッションIDでは復号化できない', async () => {
      const plaintext = 'secret message'

      // セッション1で暗号化
      sessionStorage.setItem('register_session_id', 'session-1')
      const encrypted = await encryptString(plaintext)

      // セッション2で復号化を試みる
      sessionStorage.setItem('register_session_id', 'session-2')
      await expect(decryptString(encrypted)).rejects.toThrow('データの復号化に失敗しました')
    })
  })
})
