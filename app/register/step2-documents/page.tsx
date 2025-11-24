'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CreditCard, FileImage, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDb } from '@/lib/db'
import { type RegisterDraft } from '@/lib/db'
import { DRAFT_ID, useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

export default function Step2DocumentsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
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

  // DBからデータを復元
  useEffect(() => {
    if (draft) {
      // Step2に関連するフィールドのみが上書きされる
      form.reset(draft)
    }
  }, [draft, form])

  // 書類タイプの監視（条件分岐表示用）
  // Watch can sometimes be undefined briefly — use getValues fallback and
  // ensure we have a predictable default for rendering.
  const watched = form.watch('documentType')
  const documentType = watched ?? form.getValues('documentType') ?? 'drivers_license'

  // Debug: help diagnose why the drivers_license block might not render.
  // Remove or silence this log after verification.

  console.debug('documentType (watch/getValues):', { watched, value: documentType })

  const onNext = async (data: DocumentSchema) => {
    if (!sessionId) return
    setIsSaving(true)

    try {
      // 1. 既存データと今回の入力をマージ (まだゴミが含まれる可能性がある)
      const dirtyMergedData = {
        ...draft,
        ...data,
      }

      // 2. 不要なフィールド（例: 免許証を選んだのに残っているパスポート番号など）を除去
      const cleanData = sanitizeRegisterData(dirtyMergedData)

      // 3. 保存
      const db = getDb()
      await db.registerData.put({
        id: DRAFT_ID,
        sessionId,
        ...cleanData,
        updatedAt: new Date(),
      } as RegisterDraft)

      router.push('/register/step3-confirm')
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

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
          <form onSubmit={form.handleSubmit(onNext)} className='space-y-6'>
            {/* 書類タイプ選択 */}
            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提出する書類</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <ImageUploadField form={form} name='frontImage' label='表面画像' />
                  <ImageUploadField form={form} name='backImage' label='裏面画像' />
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
                  <ImageUploadField form={form} name='frontImage' label='顔写真ページ' />
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
                  <ImageUploadField form={form} name='frontImage' label='表面 (顔写真)' />
                  <ImageUploadField form={form} name='backImage' label='裏面 (個人番号)' />
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
}: {
  form: UseFormReturn<DocumentSchema>
  name: 'frontImage' | 'backImage'
  label: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { value, onChange, ...fieldProps } }) => {
        const file = value as File | undefined
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
                      onClick={() => onChange(undefined)}
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
