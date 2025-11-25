/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test } from 'vitest'

import { type DocumentSchema } from '@/lib/schema/register-schema'

import { useDocumentFormDraftSync } from './useDocumentFormDraftSync'

describe('useDocumentFormDraftSync', () => {
  test('draftがnullの場合、フォームはリセットされない', () => {
    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, null)
      return form
    })

    // フォームはリセットされていないため、デフォルト値のまま
    expect(result.current.getValues()).toBeDefined()
  })

  test('draftがundefinedの場合、フォームはリセットされない', () => {
    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, undefined)
      return form
    })

    expect(result.current.getValues()).toBeDefined()
  })

  test('drivers_licenseのdraftデータをフォームにセットできる', () => {
    const draft = {
      documentType: 'drivers_license',
      licenseNumber: '123456789012',
      frontImage: new File([], 'front.jpg'),
      backImage: new File([], 'back.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('drivers_license')
    expect(values.licenseNumber).toBe('123456789012')
    expect(values.frontImage).toBeInstanceOf(File)
    expect(values.backImage).toBeInstanceOf(File)
  })

  test('passportのdraftデータをフォームにセットできる', () => {
    const draft = {
      documentType: 'passport',
      passportNumber: 'TK1234567',
      frontImage: new File([], 'passport.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('passport')
    expect(values.passportNumber).toBe('TK1234567')
    expect(values.frontImage).toBeInstanceOf(File)
  })

  test('my_numberのdraftデータをフォームにセットできる', () => {
    const expirationDate = new Date('2030-12-31')
    const draft = {
      documentType: 'my_number',
      myNumber: '123456789012',
      expirationDate,
      frontImage: new File([], 'front.jpg'),
      backImage: new File([], 'back.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('my_number')
    expect(values.myNumber).toBe('123456789012')
    expect(values.expirationDate).toStrictEqual(expirationDate)
    expect(values.frontImage).toBeInstanceOf(File)
    expect(values.backImage).toBeInstanceOf(File)
  })

  test('Fileオブジェクトでない画像データは無視される', () => {
    const draft = {
      documentType: 'drivers_license',
      licenseNumber: '123456789012',
      frontImage: 'invalid-file-data', // 文字列
      backImage: { name: 'fake.jpg' }, // オブジェクトだがFileではない
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('drivers_license')
    expect(values.licenseNumber).toBe('123456789012')
    expect(values.frontImage).toBeUndefined()
    expect(values.backImage).toBeUndefined()
  })

  test('documentTypeが未定義の場合、デフォルトでdrivers_licenseが設定される', () => {
    const draft = {
      licenseNumber: '123456789012',
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('drivers_license')
  })

  test('部分的なフィールドでも空文字列としてセットされる', () => {
    const draft = {
      documentType: 'drivers_license',
      // licenseNumberが未定義
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      useDocumentFormDraftSync(form, draft)
      return form
    })

    const values = result.current.getValues() as any
    expect(values.documentType).toBe('drivers_license')
    expect(values.licenseNumber).toBe('')
  })
})
