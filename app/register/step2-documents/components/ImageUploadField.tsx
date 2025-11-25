import { Upload, X } from 'lucide-react'
import { type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { type DocumentSchema } from '@/lib/schema/register-schema'

interface ImageUploadFieldProps {
  form: UseFormReturn<DocumentSchema>
  name: 'frontImage' | 'backImage'
  label: string
  handleImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}

/**
 * 画像アップロードフィールドコンポーネント (Presentational)
 * - ファイル選択UI
 * - 画像プレビュー
 * - 削除ボタン
 */
export function ImageUploadField({ form, name, label, handleImageDelete }: ImageUploadFieldProps) {
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
