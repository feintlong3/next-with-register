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
    const incrementKeyMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      return useImageDelete({
        form,
        draft: {},
        sessionId: null,
        incrementKey: incrementKeyMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    expect(incrementKeyMock).not.toHaveBeenCalled()
    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('draftがnullの場合、削除処理は実行されない', async () => {
    const incrementKeyMock = vi.fn()

    const { result } = renderHook(() => {
      const form = useForm<DocumentSchema>()
      return useImageDelete({
        form,
        draft: null,
        sessionId: 'test-session-123',
        incrementKey: incrementKeyMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    expect(incrementKeyMock).not.toHaveBeenCalled()
    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('frontImageを削除できる', async () => {
    const incrementKeyMock = vi.fn()
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
        incrementKey: incrementKeyMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    await waitFor(() => {
      // imageKeysが更新される
      expect(incrementKeyMock).toHaveBeenCalledWith('frontImage')

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
    const incrementKeyMock = vi.fn()
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
        incrementKey: incrementKeyMock,
      })
    })

    await result.current.handleImageDelete('backImage')

    await waitFor(() => {
      expect(incrementKeyMock).toHaveBeenCalledWith('backImage')
      expect(db.getDb).toHaveBeenCalled()
    })
  })

  test('incrementKeyが正しいフィールド名で呼ばれる', async () => {
    const incrementKeyMock = vi.fn()

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
        incrementKey: incrementKeyMock,
      })
    })

    await result.current.handleImageDelete('frontImage')

    await waitFor(() => {
      expect(incrementKeyMock).toHaveBeenCalledWith('frontImage')
    })
  })

  test('エラーが発生した場合、エラーログが出力される', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(encryptionHelper.encryptRegisterData).mockRejectedValueOnce(new Error('暗号化エラー'))

    const incrementKeyMock = vi.fn()
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
        incrementKey: incrementKeyMock,
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
