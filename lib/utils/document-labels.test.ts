import { describe, expect, test } from 'vitest'

import { getDocumentLabel } from './document-labels'

describe('getDocumentLabel', () => {
  test('運転免許証の場合、"運転免許証"を返す', () => {
    expect(getDocumentLabel('drivers_license')).toBe('運転免許証')
  })

  test('マイナンバーカードの場合、"マイナンバーカード"を返す', () => {
    expect(getDocumentLabel('my_number')).toBe('マイナンバーカード')
  })

  test('パスポートの場合、"パスポート"を返す', () => {
    expect(getDocumentLabel('passport')).toBe('パスポート')
  })

  test('undefinedの場合、"未選択"を返す', () => {
    expect(getDocumentLabel(undefined)).toBe('未選択')
  })

  test('不正な値の場合、"未選択"を返す', () => {
    expect(getDocumentLabel('invalid_type')).toBe('未選択')
  })

  test('空文字列の場合、"未選択"を返す', () => {
    expect(getDocumentLabel('')).toBe('未選択')
  })
})
