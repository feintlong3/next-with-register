import { useState } from 'react'

import { deleteDb } from '@/lib/db'

interface UseFormSubmitOptions {
  /** 送信成功時のコールバック */
  onSuccess: () => void
  /** 成功時のメッセージ */
  successMessage?: string
  /** エラー時のメッセージ */
  errorMessage?: string
  /** 送信前の擬似的な待機時間（ミリ秒） */
  simulatedDelay?: number
}

/**
 * フォーム送信処理を提供するフック
 * - データ送信のシミュレーション
 * - DB削除とクリーンアップ
 * - 成功/エラーハンドリング
 */
export function useFormSubmit({
  onSuccess,
  successMessage = '送信が完了しました',
  errorMessage = '送信に失敗しました',
  simulatedDelay = 800,
}: UseFormSubmitOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * フォーム送信ハンドラー
   */
  const handleSubmit = async (data?: unknown) => {
    if (!data) return

    setIsSubmitting(true)

    // 本来はここでバックエンドAPIへデータを送信
    console.log('Submitting Data:', data)

    // 擬似的な待機時間
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay))
      .then(() => deleteDb()) // データベース全体を削除してクリーンアップ
      .then(() => {
        // 完了通知
        if (successMessage) {
          alert(successMessage)
        }
        onSuccess()
      })
      .catch((error) => {
        console.error('Submission failed:', error)
        if (errorMessage) {
          alert(errorMessage)
        }
      })
      .finally(() => setIsSubmitting(false))
  }

  return {
    isSubmitting,
    handleSubmit,
  }
}
