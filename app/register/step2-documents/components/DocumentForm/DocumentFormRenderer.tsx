import { type UseFormReturn } from 'react-hook-form'

import { type DocumentSchema } from '@/lib/schema/register-schema'

import { DriverLicenseForm } from './DriverLicenseForm'
import { MyNumberForm } from './MyNumberForm'
import { PassportForm } from './PassportForm'

interface DocumentFormRendererProps {
  documentType: DocumentSchema['documentType']
  form: UseFormReturn<DocumentSchema>
  imageKeys: { frontImage: number; backImage: number }
  onImageDelete: (fieldName: 'frontImage' | 'backImage') => Promise<void>
}

/**
 * 書類タイプに応じて適切なフォームコンポーネントをレンダリング
 */
export function DocumentFormRenderer({
  documentType,
  form,
  imageKeys,
  onImageDelete,
}: DocumentFormRendererProps) {
  const formMap = {
    drivers_license: DriverLicenseForm,
    passport: PassportForm,
    my_number: MyNumberForm,
  } as const

  const FormComponent = formMap[documentType]

  return <FormComponent form={form} imageKeys={imageKeys} onImageDelete={onImageDelete} />
}
