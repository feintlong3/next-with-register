/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, test } from 'vitest'

import { type RegisterSchema } from '@/lib/schema/register-schema'

import { decryptRegisterData, encryptRegisterData } from './encryption-helper'

describe('encryption-helper', () => {
  beforeEach(() => {
    // sessionStorage をクリア
    sessionStorage.clear()
    // テスト用のセッションIDを設定
    sessionStorage.setItem('register_session_id', 'test-session-456')
  })

  describe('drivers_license（運転免許証）', () => {
    test('共通フィールドとlicenseNumberを暗号化して復号化できる', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'drivers_license',
        fullName: '山田太郎',
        email: 'test@example.com',
        phoneNumber: '09012345678',
        address: '東京都渋谷区',
        licenseNumber: '123456789012',
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
      }

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      // 復号化すると元の値に戻る
      expect(decrypted.fullName).toBe(original.fullName)
      expect(decrypted.email).toBe(original.email)
      expect(decrypted.phoneNumber).toBe(original.phoneNumber)
      expect(decrypted.address).toBe(original.address)
      expect(decrypted.licenseNumber).toBe(original.licenseNumber)

      // 暗号化されないフィールドはそのまま
      expect(encrypted.documentType).toBe(original.documentType)
      expect(encrypted.frontImage).toBe(original.frontImage)
      expect(encrypted.backImage).toBe(original.backImage)
    })

    test('機密フィールドが暗号化されている', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'drivers_license',
        fullName: '山田太郎',
        email: 'test@example.com',
        licenseNumber: '123456789012',
      }

      const encrypted = (await encryptRegisterData(original)) as any

      // 暗号化されたフィールドは元の値と異なる
      expect(encrypted.fullName).not.toBe(original.fullName)
      expect(encrypted.email).not.toBe(original.email)
      expect(encrypted.licenseNumber).not.toBe(original.licenseNumber)
    })
  })

  describe('passport（パスポート）', () => {
    test('共通フィールドとpassportNumberを暗号化して復号化できる', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'passport',
        fullName: '田中花子',
        email: 'hanako@example.com',
        phoneNumber: '08098765432',
        address: '大阪府大阪市',
        passportNumber: 'TK1234567',
        frontImage: new File([], 'passport.jpg'),
      }

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      // 復号化すると元の値に戻る
      expect(decrypted.fullName).toBe(original.fullName)
      expect(decrypted.email).toBe(original.email)
      expect(decrypted.phoneNumber).toBe(original.phoneNumber)
      expect(decrypted.address).toBe(original.address)
      expect(decrypted.passportNumber).toBe(original.passportNumber)

      // 暗号化されないフィールドはそのまま
      expect(encrypted.documentType).toBe(original.documentType)
      expect(encrypted.frontImage).toBe(original.frontImage)
    })

    test('機密フィールドが暗号化されている', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'passport',
        fullName: '田中花子',
        passportNumber: 'TK1234567',
      }

      const encrypted = (await encryptRegisterData(original)) as any

      expect(encrypted.fullName).not.toBe(original.fullName)
      expect(encrypted.passportNumber).not.toBe(original.passportNumber)
    })
  })

  describe('my_number（マイナンバーカード）', () => {
    test('共通フィールドとmyNumberを暗号化して復号化できる', async () => {
      const expirationDate = new Date('2030-12-31')
      const original: Partial<RegisterSchema> = {
        documentType: 'my_number',
        fullName: '佐藤次郎',
        email: 'jiro@example.com',
        phoneNumber: '09011112222',
        address: '福岡県福岡市',
        myNumber: '123456789012',
        expirationDate,
        frontImage: new File([], 'front.jpg'),
        backImage: new File([], 'back.jpg'),
      }

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      // 復号化すると元の値に戻る
      expect(decrypted.fullName).toBe(original.fullName)
      expect(decrypted.email).toBe(original.email)
      expect(decrypted.phoneNumber).toBe(original.phoneNumber)
      expect(decrypted.address).toBe(original.address)
      expect(decrypted.myNumber).toBe(original.myNumber)

      // 暗号化されないフィールドはそのまま
      expect(encrypted.documentType).toBe(original.documentType)
      expect(encrypted.expirationDate).toBe(expirationDate)
      expect(encrypted.frontImage).toBe(original.frontImage)
      expect(encrypted.backImage).toBe(original.backImage)
    })

    test('機密フィールドが暗号化されている', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'my_number',
        fullName: '佐藤次郎',
        myNumber: '123456789012',
      }

      const encrypted = (await encryptRegisterData(original)) as any

      expect(encrypted.fullName).not.toBe(original.fullName)
      expect(encrypted.myNumber).not.toBe(original.myNumber)
    })
  })

  describe('部分的なデータ', () => {
    test('一部のフィールドのみ存在する場合でも正しく動作する', async () => {
      const original: Partial<RegisterSchema> = {
        documentType: 'drivers_license',
        fullName: '山田太郎',
        // email, phoneNumber, address は undefined
        licenseNumber: '123456789012',
      }

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      expect(decrypted.fullName).toBe(original.fullName)
      expect(decrypted.licenseNumber).toBe(original.licenseNumber)
      expect(decrypted.email).toBeUndefined()
      expect(decrypted.phoneNumber).toBeUndefined()
      expect(decrypted.address).toBeUndefined()
    })

    test('documentTypeが未定義の場合、共通フィールドのみ暗号化する', async () => {
      const original: Partial<RegisterSchema> = {
        fullName: '名前のみ',
        email: 'email@example.com',
      }

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      expect(decrypted.fullName).toBe(original.fullName)
      expect(decrypted.email).toBe(original.email)
    })

    test('空のオブジェクトでもエラーにならない', async () => {
      const original: Partial<RegisterSchema> = {}

      const encrypted = (await encryptRegisterData(original)) as any
      const decrypted = (await decryptRegisterData(encrypted)) as any

      expect(encrypted).toEqual({})
      expect(decrypted).toEqual({})
    })
  })

  describe('他のdocumentTypeのフィールドは暗号化しない', () => {
    test('drivers_licenseの場合、passportNumberやmyNumberは暗号化しない', async () => {
      const original: any = {
        documentType: 'drivers_license',
        fullName: '山田太郎',
        licenseNumber: '123456789012',
        // 以下は暗号化されるべきではない（documentTypeが異なる）
        passportNumber: 'SHOULD_NOT_ENCRYPT',
        myNumber: 'SHOULD_NOT_ENCRYPT_2',
      }

      const encrypted = (await encryptRegisterData(original)) as any

      // drivers_licenseのフィールドは暗号化される
      expect(encrypted.fullName).not.toBe(original.fullName)
      expect(encrypted.licenseNumber).not.toBe(original.licenseNumber)

      // 他のdocumentTypeのフィールドはそのまま（暗号化されない）
      expect(encrypted.passportNumber).toBe('SHOULD_NOT_ENCRYPT')
      expect(encrypted.myNumber).toBe('SHOULD_NOT_ENCRYPT_2')
    })
  })
})
