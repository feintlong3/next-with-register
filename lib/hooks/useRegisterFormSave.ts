import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { getDb } from '@/lib/db'
import { encryptRegisterData } from '@/lib/utils/encryption-helper'

import { DRAFT_ID } from './useRegisterDraft'

interface UseRegisterFormSaveOptions {
  /** 保存成功後に遷移する先のルート */
  nextRoute: string
  /** 既存のドラフトデータ */
  draft: Record<string, unknown> | null | undefined
  /** 現在のセッションID */
  sessionId: string | null
  /** マージ後のデータに対する前処理関数（オプション） */
  preProcess?: (data: Record<string, unknown>) => Record<string, unknown>
}

/**
 * 登録フォームの保存ロジックを提供するフック
 * データのマージ、暗号化、DB保存、画面遷移を一括で処理する
 */
export function useRegisterFormSave<T>({
  nextRoute,
  draft,
  sessionId,
  preProcess,
}: UseRegisterFormSaveOptions) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  /**
   * フォームデータを保存して次のページへ遷移
   */
  const saveAndNavigate = async (data: T) => {
    // セッションIDがない場合はガード
    if (!sessionId) return

    setIsSaving(true)

    // 既存データと今回の入力をマージ
    let mergedData = {
      ...draft,
      ...data,
    }

    // 前処理関数が指定されている場合は実行
    if (preProcess) {
      mergedData = preProcess(mergedData) as typeof mergedData
    }

    await encryptRegisterData(mergedData)
      .then((encryptedData) =>
        getDb().registerData.put({
          id: DRAFT_ID,
          sessionId,
          ...encryptedData,
          updatedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      )
      .then(() => router.push(nextRoute as never))
      .catch((error) => console.error('Failed to save draft:', error))
      .finally(() => setIsSaving(false))
  }

  return {
    isSaving,
    saveAndNavigate,
  }
}
