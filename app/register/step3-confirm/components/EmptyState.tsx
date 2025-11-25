import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onBackToStep1: () => void
}

/**
 * データ不在時の表示コンポーネント (Presentational)
 * - エラーアイコン
 * - メッセージ
 * - Step1へ戻るボタン
 */
export function EmptyState({ onBackToStep1 }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-4'>
      <AlertCircle className='w-10 h-10 text-red-500' />
      <p>
        申請データが見つかりません。
        <br />
        最初からやり直してください。
      </p>
      <Button onClick={onBackToStep1}>Step 1 へ戻る</Button>
    </div>
  )
}
