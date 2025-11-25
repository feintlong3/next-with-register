import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as db from '@/lib/db'

import { useFormSubmit } from './useFormSubmit'

// モック
vi.mock('@/lib/db', () => ({
  deleteDb: vi.fn(),
}))

describe('useFormSubmit', () => {
  let alertMock: ReturnType<typeof vi.spyOn>
  let consoleLogMock: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('初期状態ではisSubmittingがfalse', () => {
    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: () => {},
      })
    )

    expect(result.current.isSubmitting).toBe(false)
  })

  test('handleSubmitを呼ぶと送信処理が実行される', async () => {
    const onSuccessMock = vi.fn()
    const testData = { name: '山田太郎', email: 'test@example.com' }

    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: onSuccessMock,
        simulatedDelay: 10, // テストを高速化
      })
    )

    // 送信開始
    await result.current.handleSubmit(testData)

    await waitFor(() => {
      expect(consoleLogMock).toHaveBeenCalledWith('Submitting Data:', testData)
      expect(db.deleteDb).toHaveBeenCalled()
      expect(alertMock).toHaveBeenCalledWith('送信が完了しました')
      expect(onSuccessMock).toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  test('送信中はisSubmittingがtrueになる', async () => {
    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: () => {},
        simulatedDelay: 100,
      })
    )

    // 送信開始（awaitしない）
    void result.current.handleSubmit({ data: 'test' })

    // 直後はisSubmittingがtrueのはず
    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(true)
    })

    // 完了後はfalseに戻る
    await waitFor(
      () => {
        expect(result.current.isSubmitting).toBe(false)
      },
      { timeout: 200 }
    )
  })

  test('dataがnullの場合は何もしない', async () => {
    const onSuccessMock = vi.fn()

    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: onSuccessMock,
      })
    )

    await result.current.handleSubmit(null)

    expect(consoleLogMock).not.toHaveBeenCalled()
    expect(db.deleteDb).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })

  test('dataがundefinedの場合は何もしない', async () => {
    const onSuccessMock = vi.fn()

    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: onSuccessMock,
      })
    )

    await result.current.handleSubmit(undefined)

    expect(consoleLogMock).not.toHaveBeenCalled()
    expect(db.deleteDb).not.toHaveBeenCalled()
    expect(onSuccessMock).not.toHaveBeenCalled()
  })

  test('カスタムメッセージが表示される', async () => {
    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: () => {},
        successMessage: 'カスタム成功メッセージ',
        simulatedDelay: 10,
      })
    )

    await result.current.handleSubmit({ data: 'test' })

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('カスタム成功メッセージ')
    })
  })

  test('エラーが発生した場合、エラーメッセージが表示される', async () => {
    const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(db.deleteDb).mockRejectedValueOnce(new Error('DB削除エラー'))

    const onSuccessMock = vi.fn()

    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: onSuccessMock,
        errorMessage: 'エラーが発生しました',
        simulatedDelay: 10,
      })
    )

    await result.current.handleSubmit({ data: 'test' })

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith('Submission failed:', expect.any(Error))
      expect(alertMock).toHaveBeenCalledWith('エラーが発生しました')
      expect(onSuccessMock).not.toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  test('successMessageが空文字列の場合、alertは表示されない', async () => {
    const { result } = renderHook(() =>
      useFormSubmit({
        onSuccess: () => {},
        successMessage: '',
        simulatedDelay: 10,
      })
    )

    await result.current.handleSubmit({ data: 'test' })

    await waitFor(() => {
      expect(db.deleteDb).toHaveBeenCalled()
      expect(alertMock).not.toHaveBeenCalled()
    })
  })
})
