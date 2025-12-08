import { type UseFormReturn } from 'react-hook-form'

import { getDb } from '@/lib/db'
import { type DocumentSchema } from '@/lib/schema/register-schema'
import { encryptRegisterData } from '@/lib/utils/encryption-helper'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

import { DRAFT_ID } from './useRegisterDraft'

interface UseDocumentTypeChangeOptions {
  form: UseFormReturn<DocumentSchema>
  draft: Record<string, unknown> | null | undefined
  sessionId: string | null
  resetKeys: () => void
}

/**
 * 書類タイプ変更時の処理を提供するフック
 * - 画像のクリア
 * - imageKeys の更新
 * - DBへの永続化
 */
export function useDocumentTypeChange({
  form,
  draft,
  sessionId,
  resetKeys,
}: UseDocumentTypeChangeOptions) {
  /**
   * 書類タイプ変更ハンドラー
   */
  const handleDocumentTypeChange = (
    newDocType: DocumentSchema['documentType'],
    fieldOnChange: (value: string) => void
  ) => {
    // 書類タイプを変更（同期的にUIを更新）
    fieldOnChange(newDocType)

    // 画像をクリア（再レンダリングをトリガー）
    form.setValue('frontImage', undefined as unknown as File, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    })
    form.setValue('backImage', undefined as unknown as File, {
      shouldValidate: false,
      shouldDirty: true,
      shouldTouch: true,
    })

    // keyを更新してコンポーネントを強制的に再マウント
    resetKeys()

    // DBも更新して、画像削除を永続化（非同期で実行）
    if (sessionId && draft) {
      void persistDocumentTypeChange(newDocType)
    }
  }

  /**
   * DB永続化処理
   */
  const persistDocumentTypeChange = async (newDocType: DocumentSchema['documentType']) => {
    const currentValues = form.getValues()
    const updatedData = {
      ...draft,
      ...currentValues,
      documentType: newDocType,
      frontImage: undefined,
      backImage: undefined,
    }
    const cleanData = sanitizeRegisterData(updatedData)

    await encryptRegisterData(cleanData)
      .then((encryptedData) =>
        getDb().registerData.put({
          id: DRAFT_ID,
          sessionId: sessionId!,
          ...encryptedData,
          updatedAt: new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
      )
      .catch((error) => console.error('Failed to update DB after documentType change:', error))
  }

  return {
    handleDocumentTypeChange,
  }
}
