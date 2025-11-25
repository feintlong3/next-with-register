'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { initializeDb } from '@/lib/db'
import { useFormDraftSync } from '@/lib/hooks/useFormDraftSync'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { useRegisterFormSave } from '@/lib/hooks/useRegisterFormSave'
import { type PersonalInfoSchema, personalInfoSchema } from '@/lib/schema/register-schema'

import { Step1BasicForm } from './components/Step1BasicForm'

export default function Step1BasicPage() {
  useEffect(() => {
    initializeDb()
  }, [])

  // カスタムフックからドラフトデータとセッションIDを取得
  const { draft, sessionId, isLoading } = useRegisterDraft()

  // フォーム定義
  const form = useForm<PersonalInfoSchema>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
    mode: 'onBlur', // フォーカスが外れた時にバリデーション
  })

  // DBからデータがロードされたらフォームに反映
  useFormDraftSync(form, draft)

  // フォームデータの保存と画面遷移
  const { isSaving, saveAndNavigate } = useRegisterFormSave<PersonalInfoSchema>({
    nextRoute: '/register/step2-documents',
    draft,
    sessionId,
  })

  // ローディング中
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  return <Step1BasicForm form={form} isSaving={isSaving} onSubmit={saveAndNavigate} />
}
