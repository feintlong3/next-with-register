import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as db from '@/lib/db'
import * as encryptionHelper from '@/lib/utils/encryption-helper'

import { useRegisterFormSave } from './useRegisterFormSave'

// モック
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

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

describe('useRegisterFormSave', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('初期状態ではisSavingがfalse', () => {
    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/step2',
        draft: null,
        sessionId: 'test-session-123',
      })
    )

    expect(result.current.isSaving).toBe(false)
  })

  test('sessionIdがnullの場合、保存処理は実行されない', async () => {
    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/step2',
        draft: null,
        sessionId: null,
      })
    )

    await result.current.saveAndNavigate({ name: 'test' })

    expect(encryptionHelper.encryptRegisterData).not.toHaveBeenCalled()
    expect(db.getDb).not.toHaveBeenCalled()
  })

  test('saveAndNavigateを呼ぶと、データが保存されて画面遷移する', async () => {
    const draft = { fullName: '既存データ', email: 'old@example.com' }
    const newData = { phoneNumber: '09012345678', address: '東京都' }

    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/step2',
        draft,
        sessionId: 'test-session-123',
      })
    )

    await result.current.saveAndNavigate(newData)

    await waitFor(() => {
      // 既存データと新データがマージされる
      expect(encryptionHelper.encryptRegisterData).toHaveBeenCalledWith({
        ...draft,
        ...newData,
      })

      // DBに保存される
      expect(db.getDb).toHaveBeenCalled()

      // 画面遷移が呼ばれる
      expect(mockPush).toHaveBeenCalledWith('/step2')

      expect(result.current.isSaving).toBe(false)
    })
  })

  test('preProcess関数が指定されている場合、データが前処理される', async () => {
    const draft = { fullName: '山田太郎' }
    const newData = { email: 'test@example.com' }
    const preProcess = vi.fn((data) => ({
      ...data,
      processed: true,
    }))

    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/confirm',
        draft,
        sessionId: 'test-session-123',
        preProcess,
      })
    )

    await result.current.saveAndNavigate(newData)

    await waitFor(() => {
      expect(preProcess).toHaveBeenCalledWith({
        ...draft,
        ...newData,
      })

      expect(encryptionHelper.encryptRegisterData).toHaveBeenCalledWith({
        fullName: '山田太郎',
        email: 'test@example.com',
        processed: true,
      })
    })
  })

  test('エラーが発生した場合、isSavingはfalseに戻る', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(encryptionHelper.encryptRegisterData).mockRejectedValueOnce(new Error('暗号化エラー'))

    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/step2',
        draft: {},
        sessionId: 'test-session-123',
      })
    )

    await result.current.saveAndNavigate({ data: 'test' })

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Failed to save draft:', expect.any(Error))
      expect(result.current.isSaving).toBe(false)
    })
  })

  test('保存中はisSavingがtrueになる', async () => {
    // 暗号化処理を遅延させる
    vi.mocked(encryptionHelper.encryptRegisterData).mockImplementation(
      (data) =>
        new Promise((resolve) => {
          setTimeout(() => resolve(data), 100)
        })
    )

    const { result } = renderHook(() =>
      useRegisterFormSave({
        nextRoute: '/step2',
        draft: {},
        sessionId: 'test-session-123',
      })
    )

    // 保存開始（awaitしない）
    void result.current.saveAndNavigate({ data: 'test' })

    // 直後はisSavingがtrueのはず
    await waitFor(() => {
      expect(result.current.isSaving).toBe(true)
    })

    // 完了後はfalseに戻る
    await waitFor(
      () => {
        expect(result.current.isSaving).toBe(false)
      },
      { timeout: 200 }
    )
  })
})
