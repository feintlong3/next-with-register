'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LandingPageContent } from '@/app/components/LandingPageContent'
import { getDb } from '@/lib/db'
import { DRAFT_ID, useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { setupAutoCleanup } from '@/lib/utils/db-cleanup'

export default function LandingPage() {
  const router = useRouter()

  // カスタムフックを使ってIndexedDBの状態を監視
  const { draft, isLoading } = useRegisterDraft()

  // アプリケーション起動時に古いドラフトデータを自動削除
  useEffect(() => {
    setupAutoCleanup()
  }, [])

  // ドラフトが存在するかどうかの判定
  const hasDraft = !!draft

  // 「新規登録」ボタンの処理
  const handleStartFresh = async () => {
    await getDb()
      .registerData.delete(DRAFT_ID)
      .then(() => router.push('/register/step1-basic'))
      .catch((error) => {
        console.error('Failed to delete draft:', error)
        // エラーでも遷移はさせる
        router.push('/register/step1-basic')
      })
  }

  // 「続きから」ボタンの処理
  const handleResume = () => {
    router.push('/register/step1-basic')
  }

  return (
    <LandingPageContent
      hasDraft={hasDraft}
      isLoading={isLoading}
      draftUpdatedAt={draft?.updatedAt}
      onStartFresh={handleStartFresh}
      onResume={handleResume}
    />
  )
}
