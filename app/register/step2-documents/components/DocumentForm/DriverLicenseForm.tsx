import { type UseFormReturn } from 'react-hook-form'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import Input from '@/components/ui/input'
import { type DocumentSchema } from '@/lib/schema/register-schema'

import { ImageUploadField } from '../ImageUploadField'

interface DriverLicenseFormProps {
  form: UseFormReturn<DocumentSchema>
  imageKeys: { frontImage: number; backImage: number }
  onImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}

export function DriverLicenseForm({ form, imageKeys, onImageDelete }: DriverLicenseFormProps) {
  return (
    <div className='animate-in fade-in slide-in-from-top-2 space-y-4'>
      <FormField
        control={form.control}
        name='licenseNumber'
        render={({ field }) => (
          <FormItem>
            <FormLabel>免許証番号 (12桁)</FormLabel>
            <FormControl>
              <Input {...field} placeholder='123456789012' className='font-mono' maxLength={12} />
            </FormControl>
            <FormDescription>ハイフンなしで入力してください</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <ImageUploadField
        key={`drivers_license-frontImage-${imageKeys.frontImage}`}
        form={form}
        name='frontImage'
        label='表面画像'
        handleImageDelete={onImageDelete}
      />
      <ImageUploadField
        key={`drivers_license-backImage-${imageKeys.backImage}`}
        form={form}
        name='backImage'
        label='裏面画像'
        handleImageDelete={onImageDelete}
      />
    </div>
  )
}
