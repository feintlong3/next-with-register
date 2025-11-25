import { describe, expect, test } from 'vitest'

import { sanitizeRegisterData } from './sanitize-register'

describe('sanitizeRegisterData', () => {
  // 共通のベースデータ
  const baseData = {
    fullName: '山田太郎',
    email: 'test@example.com',
    phoneNumber: '09012345678',
    address: '東京都渋谷区',
  }

  describe('drivers_license（運転免許証）の場合', () => {
    test('必要なフィールドのみを含むオブジェクトを返す', () => {
      const input = {
        ...baseData,
        documentType: 'drivers_license' as const,
        licenseNumber: '123456789012',
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
      }

      const result = sanitizeRegisterData(input)

      expect(result).toEqual({
        ...baseData,
        documentType: 'drivers_license',
        licenseNumber: '123456789012',
        frontImage: input.frontImage,
        backImage: input.backImage,
      })
    })

    test('不要なフィールド（passportNumber, myNumber, expirationDate）を除去する', () => {
      const input = {
        ...baseData,
        documentType: 'drivers_license' as const,
        licenseNumber: '123456789012',
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
        // 不要なフィールド
        passportNumber: 'TK1234567',
        myNumber: '999999999999',
        expirationDate: new Date(),
      }

      const result = sanitizeRegisterData(input)

      // 不要なフィールドが含まれていないことを確認
      expect(result).not.toHaveProperty('passportNumber')
      expect(result).not.toHaveProperty('myNumber')
      expect(result).not.toHaveProperty('expirationDate')
    })
  })

  describe('passport（パスポート）の場合', () => {
    test('必要なフィールドのみを含むオブジェクトを返す', () => {
      const input = {
        ...baseData,
        documentType: 'passport' as const,
        passportNumber: 'TK1234567',
        frontImage: new File([], 'front.jpg'),
      }

      const result = sanitizeRegisterData(input)

      expect(result).toEqual({
        ...baseData,
        documentType: 'passport',
        passportNumber: 'TK1234567',
        frontImage: input.frontImage,
      })
    })

    test('backImageを含めない（パスポートは裏面なし）', () => {
      const input = {
        ...baseData,
        documentType: 'passport' as const,
        passportNumber: 'TK1234567',
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'), // 不要
      }

      const result = sanitizeRegisterData(input)

      expect(result).not.toHaveProperty('backImage')
    })

    test('不要なフィールド（licenseNumber, myNumber, expirationDate）を除去する', () => {
      const input = {
        ...baseData,
        documentType: 'passport' as const,
        passportNumber: 'TK1234567',
        frontImage: new File([], 'front.jpg'),
        // 不要なフィールド
        licenseNumber: '123456789012',
        myNumber: '999999999999',
        expirationDate: new Date(),
      }

      const result = sanitizeRegisterData(input)

      expect(result).not.toHaveProperty('licenseNumber')
      expect(result).not.toHaveProperty('myNumber')
      expect(result).not.toHaveProperty('expirationDate')
    })
  })

  describe('my_number（マイナンバーカード）の場合', () => {
    test('必要なフィールドのみを含むオブジェクトを返す', () => {
      const expirationDate = new Date('2030-12-31')
      const input = {
        ...baseData,
        documentType: 'my_number' as const,
        myNumber: '123456789012',
        expirationDate,
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
      }

      const result = sanitizeRegisterData(input)

      expect(result).toEqual({
        ...baseData,
        documentType: 'my_number',
        myNumber: '123456789012',
        expirationDate,
        frontImage: input.frontImage,
        backImage: input.backImage,
      })
    })

    test('不要なフィールド（licenseNumber, passportNumber）を除去する', () => {
      const input = {
        ...baseData,
        documentType: 'my_number' as const,
        myNumber: '123456789012',
        expirationDate: new Date(),
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
        // 不要なフィールド
        licenseNumber: '123456789012',
        passportNumber: 'TK1234567',
      }

      const result = sanitizeRegisterData(input)

      expect(result).not.toHaveProperty('licenseNumber')
      expect(result).not.toHaveProperty('passportNumber')
    })
  })

  describe('documentType が未定義の場合', () => {
    test('共通フィールドのみを返す', () => {
      const input = {
        ...baseData,
        frontImage: new File([], 'front.jpg'),
        // documentType なし
        licenseNumber: '123456789012',
        passportNumber: 'TK1234567',
      }

      const result = sanitizeRegisterData(input)

      expect(result).toEqual({
        ...baseData,
        documentType: undefined,
        frontImage: input.frontImage,
      })

      // 書類固有のフィールドが含まれていないことを確認
      expect(result).not.toHaveProperty('licenseNumber')
      expect(result).not.toHaveProperty('passportNumber')
      expect(result).not.toHaveProperty('myNumber')
      expect(result).not.toHaveProperty('expirationDate')
      expect(result).not.toHaveProperty('backImage')
    })
  })

  describe('空のオブジェクトを渡した場合', () => {
    test('共通フィールドのみを返す（すべて undefined）', () => {
      const result = sanitizeRegisterData({})

      expect(result).toEqual({
        fullName: undefined,
        email: undefined,
        phoneNumber: undefined,
        address: undefined,
        documentType: undefined,
        frontImage: undefined,
      })
    })
  })
})
