'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useFormSubmit } from '@/lib/hooks/useFormSubmit'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'

import { ConfirmationView } from './components/ConfirmationView'
import { EmptyState } from './components/EmptyState'

export default function Step3ConfirmPage() {
  const router = useRouter()
  const { draft, isLoading } = useRegisterDraft()

  // フォーム送信処理
  const { isSubmitting, handleSubmit } = useFormSubmit({
    onSuccess: () => {
      alert('申請を受け付けました！')
      router.push('/')
    },
    onError: () => {
      alert('送信に失敗しました。')
    },
  })

  const onSubmit = () => handleSubmit(draft)
  const onBack = () => router.push('/register/step2-documents')
  const onBackToStep1 = () => router.push('/register/step1-basic')

  // ローディング中
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  // データがない場合（直接URLを叩いた場合など）
  if (!draft) {
    return <EmptyState onBackToStep1={onBackToStep1} />
  }

  return (
    <ConfirmationView
      draft={draft}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onBack={onBack}
    />
  )
}
