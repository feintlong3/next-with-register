import { type UseFormReturn } from 'react-hook-form'

import { getDb } from '@/lib/db'
import { type DocumentSchema } from '@/lib/schema/register-schema'
import { encryptRegisterData } from '@/lib/utils/encryption-helper'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

import { DRAFT_ID } from './useRegisterDraft'

interface UseImageDeleteOptions {
  form: UseFormReturn<DocumentSchema>
  draft: Record<string, unknown> | null | undefined
  sessionId: string | null
  incrementKey: (fieldName: 'frontImage' | 'backImage') => void
}

/**
 * 画像削除処理を提供するフック
 * - imageKeys の更新
 * - フォームのリセット
 * - DBへの永続化
 */
export function useImageDelete({ form, draft, sessionId, incrementKey }: UseImageDeleteOptions) {
  /**
   * 画像削除ハンドラー
   */
  const handleImageDelete = async (fieldName: 'frontImage' | 'backImage') => {
    if (!sessionId || !draft) return

    // keyを更新してコンポーネントを再マウント（UIを確実に更新）
    incrementKey(fieldName)

    // DBを更新
    const currentValues = form.getValues()
    form.reset({
      ...currentValues,
      [fieldName]: undefined,
    })

    const updatedData = {
      ...draft, // 既存のデータ（step1の情報など）を保持
      ...currentValues,
      [fieldName]: undefined,
    }
    const cleanData = sanitizeRegisterData(updatedData)

    await encryptRegisterData(cleanData)
      .then((encryptedData) =>
        getDb().registerData.put({
          id: DRAFT_ID,
          sessionId,
          ...encryptedData,
          updatedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      )
      .then(() => console.log('Image deleted and DB updated successfully'))
      .catch((error) => console.error('Failed to update DB after image deletion:', error))
  }

  return {
    handleImageDelete,
  }
}
