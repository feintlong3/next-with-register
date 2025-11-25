'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { type Resolver, useForm, type UseFormReturn } from 'react-hook-form'

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
import { useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { useRegisterFormSave } from '@/lib/hooks/useRegisterFormSave'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

export default function Step2DocumentsPage() {
  const router = useRouter()
  const [imageKeys, setImageKeys] = useState({ frontImage: 0, backImage: 0 })
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
    setImageKeys,
  })

  // 画像削除処理
  const { handleImageDelete } = useImageDelete({
    form,
    draft,
    sessionId,
    setImageKeys,
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

// --- サブコンポーネント: 画像アップロードUI ---
// 同じファイル内に定義して可読性を高めています
function ImageUploadField({
  form,
  name,
  label,
  handleImageDelete,
}: {
  form: UseFormReturn<DocumentSchema>
  name: 'frontImage' | 'backImage'
  label: string
  handleImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => {
        // valueが本当にFileオブジェクトかチェック
        const file = value instanceof File ? value : undefined
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className='space-y-2'>
                {!file ? (
                  // 未選択時のUI
                  <div className='border-2 border-dashed border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors relative cursor-pointer group'>
                    <input
                      type='file'
                      accept='image/*'
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) onChange(f)
                      }}
                      {...fieldProps}
                    />
                    <div className='flex flex-col items-center gap-2 text-slate-400 group-hover:text-slate-500'>
                      <Upload className='w-8 h-8' />
                      <span className='text-sm font-medium'>クリックして画像を選択</span>
                    </div>
                  </div>
                ) : (
                  // プレビュー時のUI
                  <div className='relative border rounded-lg overflow-hidden bg-white flex items-center gap-4 p-3 shadow-sm'>
                    <div className='h-16 w-16 shrink-0 bg-slate-100 rounded border overflow-hidden'>
                      {file && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={URL.createObjectURL(file)}
                          alt='Preview'
                          className='h-full w-full object-cover'
                        />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium truncate'>{file?.name}</p>
                      <p className='text-xs text-slate-500'>
                        {file ? (file.size / 1024 / 1024).toFixed(2) : '0.00'} MB
                      </p>
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='text-slate-400 hover:text-red-500'
                      onClick={() => handleImageDelete(name)}
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
