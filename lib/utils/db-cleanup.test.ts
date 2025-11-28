import { beforeEach, describe, expect, test, vi } from 'vitest'

import { setupAutoCleanup } from './db-cleanup'

// lib/db をモック
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(),
}))

describe('setupAutoCleanup', () => {
  // モック関数
  const mockGet = vi.fn()
  const mockDelete = vi.fn()

  beforeEach(async () => {
    // 各テストの前にモックをリセット
    vi.clearAllMocks()

    // getDb のモックを設定
    const { getDb } = await import('@/lib/db')
    ;(getDb as ReturnType<typeof vi.fn>).mockReturnValue({
      registerData: {
        get: mockGet,
        delete: mockDelete,
      },
    } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
  })

  test('ドラフトが存在しない場合、何もしない', async () => {
    mockGet.mockResolvedValue(undefined)

    await setupAutoCleanup()

    expect(mockGet).toHaveBeenCalledWith('register-draft')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test('ドラフトが6時間以内の場合、削除しない', async () => {
    // 1時間前に更新されたドラフト
    const recentDraft = {
      id: 'register-draft',
      updatedAt: new Date(Date.now() - 60 * 60 * 1000), // 1時間前
    }
    mockGet.mockResolvedValue(recentDraft)

    await setupAutoCleanup()

    expect(mockGet).toHaveBeenCalledWith('register-draft')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test('ドラフトがちょうど6時間の場合、削除しない', async () => {
    // ちょうど6時間前に更新されたドラフト
    const exactDraft = {
      id: 'register-draft',
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }
    mockGet.mockResolvedValue(exactDraft)

    await setupAutoCleanup()

    expect(mockGet).toHaveBeenCalledWith('register-draft')
    expect(mockDelete).not.toHaveBeenCalled()
  })

  test('ドラフトが6時間を超えている場合、削除する', async () => {
    // 7時間前に更新されたドラフト
    const oldDraft = {
      id: 'register-draft',
      updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7時間前
    }
    mockGet.mockResolvedValue(oldDraft)

    const consoleLogSpy = vi.spyOn(console, 'log')

    await setupAutoCleanup()

    expect(mockGet).toHaveBeenCalledWith('register-draft')
    expect(mockDelete).toHaveBeenCalledWith('register-draft')
    expect(consoleLogSpy).toHaveBeenCalledWith('古いドラフトデータを削除します')

    consoleLogSpy.mockRestore()
  })

  test('ドラフトが12時間以上経過している場合も削除する', async () => {
    // 12時間前に更新されたドラフト
    const veryOldDraft = {
      id: 'register-draft',
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    }
    mockGet.mockResolvedValue(veryOldDraft)

    await setupAutoCleanup()

    expect(mockDelete).toHaveBeenCalledWith('register-draft')
  })
})
