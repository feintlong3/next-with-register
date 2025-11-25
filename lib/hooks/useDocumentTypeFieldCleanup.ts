import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'

import { type DocumentSchema } from '@/lib/schema/register-schema'

/**
 * 書類タイプに応じて不要なフィールドを登録解除するフック
 * documentType が変更されたら、そのタイプに不要なフィールドを自動的に unregister する
 */
export function useDocumentTypeFieldCleanup(
  form: UseFormReturn<DocumentSchema>,
  documentType: DocumentSchema['documentType']
) {
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
}
