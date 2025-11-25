'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, CreditCard, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
import { getDb } from '@/lib/db'
import { type RegisterDraft } from '@/lib/db'
import { DRAFT_ID, useRegisterDraft } from '@/lib/hooks/useRegisterDraft'
import { type DocumentSchema, documentSchema } from '@/lib/schema/register-schema'
import { encryptRegisterData } from '@/lib/utils/encryption-helper'
import { sanitizeRegisterData } from '@/lib/utils/sanitize-register'

export default function Step2DocumentsPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingDB, setIsUpdatingDB] = useState(false)
  const [imageKeys, setImageKeys] = useState({ frontImage: 0, backImage: 0 })
  const isDeletingImageRef = useRef(false)
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
    // DB更新中または画像削除中は draft の変更を無視（UIの上書きを防ぐ）
    if (draft && !isUpdatingDB && !isDeletingImageRef.current) {
      // draftデータとdefaultValuesをマージして、undefinedのフィールドを防ぐ
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const draftAny = draft as any
      const safeData = {
        documentType: (draftAny.documentType ??
          'drivers_license') as DocumentSchema['documentType'],
        licenseNumber: draftAny.licenseNumber ?? '',
        passportNumber: draftAny.passportNumber ?? '',
        myNumber: draftAny.myNumber ?? '',
        expirationDate: draftAny.expirationDate,
        // 画像は有効なFileオブジェクトの場合のみ復元
        frontImage: draftAny.frontImage instanceof File ? draftAny.frontImage : undefined,
        backImage: draftAny.backImage instanceof File ? draftAny.backImage : undefined,
      }
      form.reset(safeData as DocumentSchema)
    }
  }, [draft, form, isUpdatingDB])

  // 書類タイプの監視（条件分岐表示用）
  const watched = form.watch('documentType')
  const documentType = watched ?? form.getValues('documentType') ?? 'drivers_license'

  // documentTypeが変更された時に、不要なフィールドを登録解除
  useEffect(() => {
    const currentDocType = form.getValues('documentType')

    // documentTypeに応じて、不要なフィールドを登録解除
    if (currentDocType === 'drivers_license') {
      // パスポートとマイナンバーのフィールドを登録解除
      form.unregister('passportNumber')
      form.unregister('myNumber')
      form.unregister('expirationDate')
    } else if (currentDocType === 'passport') {
      // 免許証とマイナンバーのフィールドを登録解除
      form.unregister('licenseNumber')
      form.unregister('myNumber')
      form.unregister('expirationDate')
    } else if (currentDocType === 'my_number') {
      // 免許証とパスポートのフィールドを登録解除
      form.unregister('licenseNumber')
      form.unregister('passportNumber')
    }
  }, [documentType, form])

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

      const encryptedData = await encryptRegisterData(cleanData)

      // 3. 保存
      const db = getDb()
      await db.registerData.put({
        id: DRAFT_ID,
        sessionId,
        ...encryptedData,
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
                  <Select
                    onValueChange={(value) => {
                      // 書類タイプを変更（同期的にUIを更新）
                      field.onChange(value)

                      // 画像をクリア（再レンダリングをトリガー）
                      form.setValue('frontImage', undefined as unknown as File, {
                        shouldValidate: false,
                        shouldDirty: true,
                        shouldTouch: true,
                      })
                      form.setValue('backImage', undefined as unknown as File, {
                        shouldValidate: false,
                        shouldDirty: true,
                        shouldTouch: true,
                      })

                      // keyを更新してコンポーネントを強制的に再マウント
                      setImageKeys((prev) => ({
                        frontImage: prev.frontImage + 1,
                        backImage: prev.backImage + 1,
                      }))

                      // DBも更新して、画像削除を永続化（非同期で実行）
                      if (sessionId && draft) {
                        setIsUpdatingDB(true)

                        const persistDocumentTypeChange = async (
                          newDocType: DocumentSchema['documentType']
                        ) => {
                          setIsUpdatingDB(true)
                          try {
                            const currentValues = form.getValues()
                            const updatedData = {
                              ...draft,
                              ...currentValues,
                              documentType: newDocType,
                              frontImage: undefined,
                              backImage: undefined,
                            }
                            const cleanData = sanitizeRegisterData(updatedData)
                            const encryptedData = await encryptRegisterData(cleanData)

                            const db = getDb()
                            await db.registerData.put({
                              id: DRAFT_ID,
                              sessionId,
                              ...encryptedData,
                              updatedAt: new Date(),
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            } as any)
                          } catch (error) {
                            console.error('Failed to update DB after documentType change:', error)
                          } finally {
                            setIsUpdatingDB(false)
                          }
                        }
                        void persistDocumentTypeChange(value as DocumentSchema['documentType'])
                      }
                    }}
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
                    sessionId={sessionId}
                    draft={draft}
                    setIsUpdatingDB={setIsUpdatingDB}
                    isDeletingImageRef={isDeletingImageRef}
                    setImageKeys={setImageKeys}
                  />
                  <ImageUploadField
                    key={`${documentType}-backImage-${imageKeys.backImage}`}
                    form={form}
                    name='backImage'
                    label='裏面画像'
                    sessionId={sessionId}
                    draft={draft}
                    setIsUpdatingDB={setIsUpdatingDB}
                    isDeletingImageRef={isDeletingImageRef}
                    setImageKeys={setImageKeys}
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
                    sessionId={sessionId}
                    draft={draft}
                    setIsUpdatingDB={setIsUpdatingDB}
                    isDeletingImageRef={isDeletingImageRef}
                    setImageKeys={setImageKeys}
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
                    sessionId={sessionId}
                    draft={draft}
                    setIsUpdatingDB={setIsUpdatingDB}
                    isDeletingImageRef={isDeletingImageRef}
                    setImageKeys={setImageKeys}
                  />
                  <ImageUploadField
                    key={`${documentType}-backImage-${imageKeys.backImage}`}
                    form={form}
                    name='backImage'
                    label='裏面 (個人番号)'
                    sessionId={sessionId}
                    draft={draft}
                    setIsUpdatingDB={setIsUpdatingDB}
                    isDeletingImageRef={isDeletingImageRef}
                    setImageKeys={setImageKeys}
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
  sessionId,
  draft,
  setIsUpdatingDB,
  isDeletingImageRef,
  setImageKeys,
}: {
  form: UseFormReturn<DocumentSchema>
  name: 'frontImage' | 'backImage'
  label: string
  sessionId: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draft: any
  setIsUpdatingDB: (value: boolean) => void
  isDeletingImageRef: React.MutableRefObject<boolean>
  setImageKeys: React.Dispatch<React.SetStateAction<{ frontImage: number; backImage: number }>>
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
                      onClick={async () => {
                        if (!sessionId || !draft) return

                        try {
                          // 削除中フラグを立てる（同期的に設定）
                          isDeletingImageRef.current = true
                          // DBアップデート中フラグも立てる
                          setIsUpdatingDB(true)

                          // keyを更新してコンポーネントを再マウント（UIを確実に更新）
                          setImageKeys((prev) => ({ ...prev, [name]: prev[name] + 1 }))

                          // DBを更新（await で完了を待つ）
                          const currentValues = form.getValues()
                          form.reset({
                            ...currentValues,
                            [name]: undefined,
                          })
                          const updatedData = {
                            ...draft, // 既存のデータ（step1の情報など）を保持
                            ...currentValues,
                            [name]: undefined,
                          }
                          const cleanData = sanitizeRegisterData(updatedData)
                          const encryptedData = await encryptRegisterData(cleanData)

                          const db = getDb()
                          await db.registerData
                            .put({
                              id: DRAFT_ID,
                              sessionId,
                              ...encryptedData,
                              updatedAt: new Date(),
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            } as any)
                            .then(() => {
                              console.log('Image deleted and DB updated successfully')
                            })
                        } catch (error) {
                          console.error('Failed to update DB after image deletion:', error)
                        } finally {
                          setIsUpdatingDB(false)
                          // 少し待ってから削除フラグを下ろす（useLiveQueryが新しいデータを返すまで）
                          setTimeout(() => {
                            isDeletingImageRef.current = false
                          }, 100)
                        }
                      }}
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
