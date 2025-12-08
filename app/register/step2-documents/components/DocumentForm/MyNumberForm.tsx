import { type UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Input from '@/components/ui/input'
import { type DocumentSchema } from '@/lib/schema/register-schema'

import { ImageUploadField } from '../ImageUploadField'

interface MyNumberFormProps {
  form: UseFormReturn<DocumentSchema>
  imageKeys: { frontImage: number; backImage: number }
  onImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}

export function MyNumberForm({ form, imageKeys, onImageDelete }: MyNumberFormProps) {
  return (
    <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
      <FormField
        control={form.control}
        name='myNumber'
        render={({ field }) => (
          <FormItem>
            <FormLabel>個人番号 (12桁)</FormLabel>
            <FormControl>
              <Input {...field} placeholder='123456789012' className='font-mono' maxLength={12} />
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
        key={`my_number-frontImage-${imageKeys.frontImage}`}
        form={form}
        name='frontImage'
        label='表面 (顔写真)'
        handleImageDelete={onImageDelete}
      />
      <ImageUploadField
        key={`my_number-backImage-${imageKeys.backImage}`}
        form={form}
        name='backImage'
        label='裏面 (個人番号)'
        handleImageDelete={onImageDelete}
      />
    </div>
  )
}
