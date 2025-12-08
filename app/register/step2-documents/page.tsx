'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CreditCard, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type Resolver, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Input from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDocumentFormDraftSync } from '@/lib/hooks/useDocumentFormDraftSync'
import { useDocumentTypeChange } from '@/lib/hooks/useDocumentTypeChange'
import { useDocumentTypeFieldCleanup } from '@/lib/hooks/useDocumentTypeFieldCleanup'
import { useImageDelete } from '@/lib/hooks/useImageDelete'
import { useImageKeys } from '@/lib/hooks/useImageKeys'
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { useRegisterFormSave } from '@/lib/hooks/useRegisterFormSave'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

import { ImageUploadField } from './components/ImageUploadField'

export default function Step2DocumentsPage() {
  const router = useRouter()
  const { imageKeys, incrementKey, resetKeys } = useImageKeys()
  const { draft, sessionId, isLoading } = useRegisterDraft()

  const form = useForm<DocumentSchema>({
    resolver: zodResolver(documentSchema) as Resolver<DocumentSchema>,
    defaultValues: {
      documentType: 'drivers_license',
      licenseNumber: '',
      passportNumber: '',
      myNumber: '',
      expirationDate: undefined,
      frontImage: undefined,
      backImage: undefined,
    } as unknown as DocumentSchema,
    mode: 'onChange',
  })

  // DBからデータを復元（書類フォーム専用）
  useDocumentFormDraftSync(form, draft)

  // 書類タイプの監視（条件分岐表示用）
  // eslint-disable-next-line react-hooks/incompatible-library
  const watched = form.watch('documentType')
  const documentType = watched ?? form.getValues('documentType') ?? 'drivers_license'

  // 書類タイプに応じて不要なフィールドを登録解除
  useDocumentTypeFieldCleanup(form, documentType)

  // 書類タイプ変更時の処理
  const { handleDocumentTypeChange } = useDocumentTypeChange({
    form,
    draft,
    sessionId,
    resetKeys,
  })

  // 画像削除処理
  const { handleImageDelete } = useImageDelete({
    form,
    draft,
    sessionId,
    incrementKey,
  })

  // フォームデータの保存と画面遷移
  const { isSaving, saveAndNavigate } = useRegisterFormSave<DocumentSchema>({
    nextRoute: '/register/step3-confirm',
    draft,
    sessionId,
    preProcess: sanitizeRegisterData, // 不要なフィールドを除去
  })

  const onBack = () => {
    router.push('/register/step1-basic')
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    )
  }

  return (
    <Card className='w-full max-w-2xl mx-auto shadow-sm animate-in fade-in slide-in-from-right-8 duration-500'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-2xl'>
          <div className='bg-blue-100 p-2 rounded-lg'>
            <CreditCard className='w-6 h-6 text-blue-600' />
          </div>
          本人確認書類の選択
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(saveAndNavigate)} className='space-y-6'>
            {/* 書類タイプ選択 */}
            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提出する書類</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      handleDocumentTypeChange(
                        value as DocumentSchema['documentType'],
                        field.onChange
                      )
                    }
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='選択してください' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='drivers_license'>運転免許証</SelectItem>
                      <SelectItem value='my_number'>マイナンバーカード</SelectItem>
                      <SelectItem value='passport'>パスポート</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='p-4 border rounded-lg bg-slate-50/50 space-y-4'>
              {/* ▼▼▼ 運転免許証 ▼▼▼ */}
              {documentType === 'drivers_license' && (
                <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
                  <FormField
                    control={form.control}
                    name='licenseNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>免許証番号 (12桁)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='123456789012'
                            className='font-mono'
                            maxLength={12}
                          />
                        </FormControl>
                        <FormDescription>ハイフンなしで入力してください</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ImageUploadField
                    key={`${documentType}-frontImage-${imageKeys.frontImage}`}
                    form={form}
                    name='frontImage'
                    label='表面画像'
                    handleImageDelete={handleImageDelete}
                  />
                  <ImageUploadField
                    key={`${documentType}-backImage-${imageKeys.backImage}`}
                    form={form}
                    name='backImage'
                    label='裏面画像'
                    handleImageDelete={handleImageDelete}
                  />
                </div>
              )}

              {/* ▼▼▼ パスポート ▼▼▼ */}
              {documentType === 'passport' && (
                <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
                  <FormField
                    control={form.control}
                    name='passportNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>旅券番号</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='TK1234567'
                            className='font-mono uppercase'
                            maxLength={9}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ImageUploadField
                    key={`${documentType}-frontImage-${imageKeys.frontImage}`}
                    form={form}
                    name='frontImage'
                    label='顔写真ページ'
                    handleImageDelete={handleImageDelete}
                  />
                </div>
              )}

              {/* ▼▼▼ マイナンバーカード ▼▼▼ */}
              {documentType === 'my_number' && (
                <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
                  <FormField
                    control={form.control}
                    name='myNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>個人番号 (12桁)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder='123456789012'
                            className='font-mono'
                            maxLength={12}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='expirationDate'
                    render={({ field }) => {
                      const { onChange, value, ...rest } = field
                      return (
                        <FormItem>
                          <FormLabel>有効期限</FormLabel>
                          <FormControl>
                            <Input
                              type='date'
                              {...rest}
                              value={value ? new Date(value).toISOString().split('T')[0] : ''}
                              onChange={(e) => {
                                const v = (e.target as HTMLInputElement).value
                                onChange(v ? new Date(v) : undefined)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />
                  <ImageUploadField
                    key={`${documentType}-frontImage-${imageKeys.frontImage}`}
                    form={form}
                    name='frontImage'
                    label='表面 (顔写真)'
                    handleImageDelete={handleImageDelete}
                  />
                  <ImageUploadField
                    key={`${documentType}-backImage-${imageKeys.backImage}`}
                    form={form}
                    name='backImage'
                    label='裏面 (個人番号)'
                    handleImageDelete={handleImageDelete}
                  />
                </div>
              )}
            </div>

            {/* ナビゲーションボタン */}
            <div className='flex justify-between pt-6 border-t'>
              <Button type='button' variant='outline' onClick={onBack} disabled={isSaving}>
                <ArrowLeft className='mr-2 w-4 h-4' /> 戻る
              </Button>
              <Button type='submit' disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 保存中...
                  </>
                ) : (
                  <>
                    確認画面へ <ArrowRight className='ml-2 w-4 h-4' />
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
