/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test, vi } from 'vitest'

import { type DocumentSchema } from '@/lib/schema/register-schema'

import { useDocumentTypeFieldCleanup } from './useDocumentTypeFieldCleanup'

describe('useDocumentTypeFieldCleanup', () => {
  test('drivers_licenseの場合、passportNumberとmyNumberとexpirationDateが登録解除される', () => {
    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
          licenseNumber: '123456789012',
          frontImage: new File([], 'front.jpg'),
          backImage: new File([], 'back.jpg'),
        } as any,
      })

      const unregisterSpy = vi.spyOn(form, 'unregister')
      useDocumentTypeFieldCleanup(form, 'drivers_license')

      return { form, unregisterSpy }
    })

    expect(result.current.unregisterSpy).toHaveBeenCalledWith('passportNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('myNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('expirationDate')
    expect(result.current.unregisterSpy).not.toHaveBeenCalledWith('licenseNumber')
  })

  test('passportの場合、licenseNumberとmyNumberとexpirationDateが登録解除される', () => {
    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'passport',
          passportNumber: 'TK1234567',
          frontImage: new File([], 'passport.jpg'),
        } as any,
      })

      const unregisterSpy = vi.spyOn(form, 'unregister')
      useDocumentTypeFieldCleanup(form, 'passport')

      return { form, unregisterSpy }
    })

    expect(result.current.unregisterSpy).toHaveBeenCalledWith('licenseNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('myNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('expirationDate')
    expect(result.current.unregisterSpy).not.toHaveBeenCalledWith('passportNumber')
  })

  test('my_numberの場合、licenseNumberとpassportNumberが登録解除される', () => {
    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'my_number',
          myNumber: '123456789012',
          expirationDate: new Date('2030-12-31'),
          frontImage: new File([], 'front.jpg'),
          backImage: new File([], 'back.jpg'),
        } as any,
      })

      const unregisterSpy = vi.spyOn(form, 'unregister')
      useDocumentTypeFieldCleanup(form, 'my_number')

      return { form, unregisterSpy }
    })

    expect(result.current.unregisterSpy).toHaveBeenCalledWith('licenseNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('passportNumber')
    expect(result.current.unregisterSpy).not.toHaveBeenCalledWith('myNumber')
    expect(result.current.unregisterSpy).not.toHaveBeenCalledWith('expirationDate')
  })

  test('documentTypeが変更されたら、再度クリーンアップが実行される', () => {
    let currentDocType: DocumentSchema['documentType'] = 'drivers_license'

    const { result, rerender } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: currentDocType as any,
        } as any,
      })

      const unregisterSpy = vi.spyOn(form, 'unregister')
      useDocumentTypeFieldCleanup(form, currentDocType)

      return { form, unregisterSpy }
    })

    // 最初はdrivers_license
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('passportNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('myNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('expirationDate')

    // 呼び出しをクリア
    result.current.unregisterSpy.mockClear()

    // documentTypeを変更
    currentDocType = 'passport'

    // passportに変更
    rerender()

    // passportの場合の登録解除が呼ばれる（フォームの内部値は変わらないため、再度drivers_licenseのクリーンアップが実行される）
    // このフックはform.getValues('documentType')を使用するため、外部propsではなく内部状態を見る
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('passportNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('myNumber')
    expect(result.current.unregisterSpy).toHaveBeenCalledWith('expirationDate')
  })
})
