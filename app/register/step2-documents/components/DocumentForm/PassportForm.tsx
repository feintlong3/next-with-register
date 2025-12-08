import { type UseFormReturn } from 'react-hook-form'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Input from '@/components/ui/input'
import { type DocumentSchema } from '@/lib/schema/register-schema'

import { ImageUploadField } from '../ImageUploadField'

interface PassportFormProps {
  form: UseFormReturn<DocumentSchema>
  imageKeys: { frontImage: number; backImage: number }
  onImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}

export function PassportForm({ form, imageKeys, onImageDelete }: PassportFormProps) {
  return (
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
        key={`passport-frontImage-${imageKeys.frontImage}`}
        form={form}
        name='frontImage'
        label='顔写真ページ'
        handleImageDelete={onImageDelete}
      />
    </div>
  )
}
