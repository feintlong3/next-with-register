import { useState } from 'react'

import { deleteDb } from '@/lib/db'

interface UseFormSubmitOptions {
  /** 送信成功時のコールバック */
  onSuccess: () => void
  /** エラー時のコールバック */
  onError?: (error: unknown) => void
  /** 送信前の擬似的な待機時間（ミリ秒） */
  simulatedDelay?: number
}

/**
 * フォーム送信処理を提供するフック
 * - データ送信のシミュレーション
 * - DB削除とクリーンアップ
 * - 成功/エラーハンドリング
 */
export function useFormSubmit({ onSuccess, onError, simulatedDelay = 800 }: UseFormSubmitOptions) {
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
    try {
      await new Promise((resolve) => setTimeout(resolve, simulatedDelay))
      await deleteDb() // データベース全体を削除してクリーンアップ
      onSuccess()
    } catch (error) {
      console.error('Submission failed:', error)
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    isSubmitting,
    handleSubmit,
  }
}
