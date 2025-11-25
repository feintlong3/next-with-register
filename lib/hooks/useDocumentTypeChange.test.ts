/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as db from '@/lib/db'
import { type DocumentSchema } from '@/lib/schema/register-schema'
import * as encryptionHelper from '@/lib/utils/encryption-helper'
import * as sanitizeRegister from '@/lib/utils/sanitize-register'

import { useDocumentTypeChange } from './useDocumentTypeChange'

// モック
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => ({
    registerData: {
      put: vi.fn().mockResolvedValue(undefined),
    },
  })),
}))

vi.mock('@/lib/utils/encryption-helper', () => ({
  encryptRegisterData: vi.fn((data) => Promise.resolve(data)),
}))

vi.mock('@/lib/utils/sanitize-register', () => ({
  sanitizeRegisterData: vi.fn((data) => data),
}))

describe('useDocumentTypeChange', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('handleDocumentTypeChangeを呼ぶと、documentTypeが変更される', () => {
    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
          licenseNumber: '123456789012',
          frontImage: new File([], 'front.jpg'),
          backImage: new File([], 'back.jpg'),
        } as any,
      })

      return useDocumentTypeChange({
        form,
        draft: {},
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    // documentTypeの変更コールバックが呼ばれる
    expect(fieldOnChangeMock).toHaveBeenCalledWith('passport')
  })

  test('documentType変更時に画像フィールドがクリアされる', () => {
    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
          licenseNumber: '123456789012',
          frontImage: new File([], 'front.jpg'),
          backImage: new File([], 'back.jpg'),
        } as any,
      })

      const setValueSpy = vi.spyOn(form, 'setValue')

      return {
        hook: useDocumentTypeChange({
          form,
          draft: {},
          sessionId: 'test-session-123',
          setImageKeys: setImageKeysMock,
        }),
        setValueSpy,
      }
    })

    result.current.hook.handleDocumentTypeChange('passport', fieldOnChangeMock)

    // 画像フィールドがundefinedに設定される
    expect(result.current.setValueSpy).toHaveBeenCalledWith(
      'frontImage',
      undefined,
      expect.any(Object)
    )
    expect(result.current.setValueSpy).toHaveBeenCalledWith(
      'backImage',
      undefined,
      expect.any(Object)
    )
  })

  test('documentType変更時にimageKeysが更新される', () => {
    let capturedUpdater: any = null
    const setImageKeysMock = vi.fn((updater) => {
      capturedUpdater = updater
    })
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
        } as any,
      })

      return useDocumentTypeChange({
        form,
        draft: {},
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    expect(setImageKeysMock).toHaveBeenCalled()

    // updater関数をテスト
    const prevState = { frontImage: 1, backImage: 2 }
    const newState = capturedUpdater(prevState)

    expect(newState.frontImage).toBe(2) // インクリメント
    expect(newState.backImage).toBe(3) // インクリメント
  })

  test('sessionIdとdraftが存在する場合、DBが更新される', async () => {
    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()
    const draft = {
      documentType: 'drivers_license',
      licenseNumber: '123456789012',
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: draft as any,
      })

      return useDocumentTypeChange({
        form,
        draft,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    await waitFor(() => {
      expect(sanitizeRegister.sanitizeRegisterData).toHaveBeenCalled()
      expect(encryptionHelper.encryptRegisterData).toHaveBeenCalled()
      expect(db.getDb).toHaveBeenCalled()
    })
  })

  test('sessionIdがnullの場合、DBは更新されない', async () => {
    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
        } as any,
      })

      return useDocumentTypeChange({
        form,
        draft: {},
        sessionId: null,
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    // 少し待ってもDBは呼ばれない
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('draftがnullの場合、DBは更新されない', async () => {
    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
        } as any,
      })

      return useDocumentTypeChange({
        form,
        draft: null,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('DB更新時にエラーが発生しても、UIの更新は完了する', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(encryptionHelper.encryptRegisterData).mockRejectedValueOnce(new Error('暗号化エラー'))

    const setImageKeysMock = vi.fn()
    const fieldOnChangeMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: {
          documentType: 'drivers_license',
        } as any,
      })

      return useDocumentTypeChange({
        form,
        draft: {},
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    result.current.handleDocumentTypeChange('passport', fieldOnChangeMock)

    // UIの更新は完了している
    expect(fieldOnChangeMock).toHaveBeenCalledWith('passport')
    expect(setImageKeysMock).toHaveBeenCalled()

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Failed to update DB after documentType change:',
        expect.any(Error)
      )
    })
  })
})
