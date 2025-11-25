/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as db from '@/lib/db'
import { type DocumentSchema } from '@/lib/schema/register-schema'
import * as encryptionHelper from '@/lib/utils/encryption-helper'
import * as sanitizeRegister from '@/lib/utils/sanitize-register'

import { useImageDelete } from './useImageDelete'

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

describe('useImageDelete', () => {
  let consoleLogMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('sessionIdがnullの場合、削除処理は実行されない', async () => {
    const setImageKeysMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      return useImageDelete({
        form,
        draft: {},
        sessionId: null,
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    expect(setImageKeysMock).not.toHaveBeenCalled()
    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('draftがnullの場合、削除処理は実行されない', async () => {
    const setImageKeysMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      return useImageDelete({
        form,
        draft: null,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    expect(setImageKeysMock).not.toHaveBeenCalled()
    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('frontImageを削除できる', async () => {
    const setImageKeysMock = vi.fn()
    const draft = {
      documentType: 'drivers_license',
      licenseNumber: '123456789012',
      frontImage: new File([], 'front.jpg'),
      backImage: new File([], 'back.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: draft as any,
      })
      return useImageDelete({
        form,
        draft,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    await waitFor(() => {
      // imageKeysが更新される
      expect(setImageKeysMock).toHaveBeenCalledWith(expect.any(Function))

      // sanitizeが呼ばれる
      expect(sanitizeRegister.sanitizeRegisterData).toHaveBeenCalled()

      // 暗号化が呼ばれる
      expect(encryptionHelper.encryptRegisterData).toHaveBeenCalled()

      // DBが更新される
      expect(db.getDb).toHaveBeenCalled()

      expect(consoleLogMock).toHaveBeenCalledWith('Image deleted and DB updated successfully')
    })
  })

  test('backImageを削除できる', async () => {
    const setImageKeysMock = vi.fn()
    const draft = {
      documentType: 'drivers_license',
      licenseNumber: '123456789012',
      frontImage: new File([], 'front.jpg'),
      backImage: new File([], 'back.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: draft as any,
      })
      return useImageDelete({
        form,
        draft,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('backImage')

    await waitFor(() => {
      expect(setImageKeysMock).toHaveBeenCalledWith(expect.any(Function))
      expect(db.getDb).toHaveBeenCalled()
    })
  })

  test('setImageKeysが正しく呼ばれ、指定したフィールドのkeyのみインクリメントされる', async () => {
    let capturedUpdater: any = null
    const setImageKeysMock = vi.fn((updater) => {
      capturedUpdater = updater
    })

    const draft = {
      documentType: 'drivers_license',
      frontImage: new File([], 'front.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: draft as any,
      })
      return useImageDelete({
        form,
        draft,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    await waitFor(() => {
      expect(setImageKeysMock).toHaveBeenCalled()
    })

    // updater関数をテスト
    const prevState = { frontImage: 1, backImage: 2 }
    const newState = capturedUpdater(prevState)

    expect(newState.frontImage).toBe(2) // インクリメント
    expect(newState.backImage).toBe(2) // 変更なし
  })

  test('エラーが発生した場合、エラーログが出力される', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(encryptionHelper.encryptRegisterData).mockRejectedValueOnce(new Error('暗号化エラー'))

    const setImageKeysMock = vi.fn()
    const draft = {
      documentType: 'drivers_license',
      frontImage: new File([], 'front.jpg'),
    }

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>({
        defaultValues: draft as any,
      })
      return useImageDelete({
        form,
        draft,
        sessionId: 'test-session-123',
        setImageKeys: setImageKeysMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'Failed to update DB after image deletion:',
        expect.any(Error)
      )
    })
  })
})
