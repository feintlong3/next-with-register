'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Loader2, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Input from '@/components/ui/input'
import { initializeDb } from '@/lib/db'
import { useFormDraftSync } from '@/lib/hooks/useFormDraftSync'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { useRegisterFormSave } from '@/lib/hooks/useRegisterFormSave'
import { type PersonalInfoSchema, personalInfoSchema } from '@/lib/schema/register-schema'

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

  // ローディング中は何も表示しないか、スケルトンを表示
  // (フック側で初期化が終わるのを待つ)
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  return (
    <Card className='w-full max-w-2xl mx-auto shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-2xl'>
          <div className='bg-blue-100 p-2 rounded-lg'>
            <User className='w-6 h-6 text-blue-600' />
          </div>
          基本情報の入力
        </CardTitle>
        <CardDescription>お客様のご連絡先を入力してください。</CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveAndNavigate)} className='space-y-6'>
            {/* 氏名 */}
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    氏名 <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='山田 太郎' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* メールアドレス & 電話番号 (2カラムレイアウト) */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      メールアドレス <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='example@email.com' type='email' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      電話番号 <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='09012345678' type='tel' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 住所 */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    住所 <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='東京都...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* アクションボタンエリア */}
            <div className='flex justify-end pt-6 border-t mt-8'>
              <Button
                type='submit'
                size='lg'
                className='w-full md:w-auto min-w-[140px]'
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 保存中...
                  </>
                ) : (
                  <>
                    次へ進む <ArrowRight className='ml-2 w-4 h-4' />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
