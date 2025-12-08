import { useState } from 'react'

interface ImageKeys {
  frontImage: number
  backImage: number
}

/**
 * 画像キー管理フック
 * - frontImage と backImage のキー値を管理
 * - キーをインクリメントしてコンポーネントの再マウントを促す
 */
export function useImageKeys() {
  const [imageKeys, setImageKeys] = useState<ImageKeys>({ frontImage: 0, backImage: 0 })

  /**
   * 特定のフィールドのキーをインクリメント
   */
  const incrementKey = (fieldName: 'frontImage' | 'backImage') => {
    setImageKeys((prev) => ({ ...prev, [fieldName]: prev[fieldName] + 1 }))
  }

  /**
   * 両方のフィールドのキーをインクリメント（書類タイプ変更時など）
   */
  const resetKeys = () => {
    setImageKeys((prev) => ({
      frontImage: prev.frontImage + 1,
      backImage: prev.backImage + 1,
    }))
  }

  return {
    imageKeys,
    incrementKey,
    resetKeys,
  }
}
